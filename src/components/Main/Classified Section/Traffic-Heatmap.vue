<template>
  <div
    ref="rootRef"
    class="th-root"
    :style="{
      '--th-cell': `${cellSize}px`,
      '--th-gap': `${gapSize}px`,
      '--th-group-gap': `${groupGap}px`,
      '--th-column-gap': `${columnGap}px`,
      '--th-label-column': `${labelColumnWidth}px`,
    }"
  >
    <div class="th-grid">
      <div v-for="columnIndex in COLUMNS" :key="`header-${columnIndex}`" class="th-weekday-header">
        <span v-for="label in WEEKDAY_LABELS" :key="label" class="th-weekday-label">{{ label }}</span>
      </div>
      <div v-for="group in monthGroups" :key="group.label" class="th-month-group">
        <div class="th-month-label">{{ group.label }}</div>
        <div class="th-month-weeks">
          <div v-for="(week, weekIndex) in group.weeks" :key="weekIndex" class="th-week-row">
            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="th-cell"
              :class="day ? `th-level-${levelFor(day.count)}` : 'th-cell--empty'"
              :title="cellTitle(day)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { heatmapDays, loadHeatmapSummary, type HeatmapDay } from '@modules/miscHeatmap'

  const WEEKDAY_LABELS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
  const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  // Months read left-to-right in rows of three: JAN FEB MAR / APR MAY JUN / …
  const COLUMNS = 3

  const MIN_CELL_SIZE = 4
  const MAX_CELL_SIZE = 26
  // Every spacing in the grid is expressed as a multiple of one cell, so a
  // single solved cell size scales gaps, labels and the whole grid together.
  const GAP_RATIO = 0.28
  const GROUP_GAP_RATIO = 0.9
  const COLUMN_GAP_RATIO = 1.4
  const LABEL_COLUMN_RATIO = 0.85
  const WEEKDAY_HEADER_RATIO = 0.7

  const rootRef = ref<HTMLElement | null>(null)
  const cellSize = ref(16)
  const gapSize = ref(4)
  const groupGap = ref(8)
  const columnGap = ref(12)
  const labelColumnWidth = ref(14)
  let resizeObserver: ResizeObserver | null = null

  interface MonthGroup {
    label: string
    weeks: (HeatmapDay | null)[][]
  }

  // UTC throughout: the server stamps Date as a calendar day with no time
  // component, so parsing/bucketing in local time could shift a day across
  // the midnight boundary and land it in the wrong week.
  const YEAR = new Date().getUTCFullYear()

  // Whole calendar year, split into one group per month so weeks never span a
  // month boundary — that's what lets a wider gap sit between months. Days
  // outside the month but inside its edge weeks are left null (rendered
  // invisible) purely to keep every row aligned to Monday-first columns.
  const monthGroups = computed<MonthGroup[]>(() => {
    const dayMap = new Map(heatmapDays.value.map((day) => [day.date, day]))
    return MONTH_LABELS.map((label, month) => {
      const daysInMonth = new Date(Date.UTC(YEAR, month + 1, 0)).getUTCDate()
      const weeks: (HeatmapDay | null)[][] = []
      let week: (HeatmapDay | null)[] = new Array(7).fill(null)
      for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
        const date = new Date(Date.UTC(YEAR, month, dayOfMonth))
        const dateString = date.toISOString().slice(0, 10)
        const weekdayIndex = (date.getUTCDay() + 6) % 7
        week[weekdayIndex] = dayMap.get(dateString) ?? { date: dateString, count: 0 }
        if (weekdayIndex === 6 || dayOfMonth === daysInMonth) {
          weeks.push(week)
          week = new Array(7).fill(null)
        }
      }
      return { label, weeks }
    })
  })

  const maxCount = computed(() => heatmapDays.value.reduce((max, day) => Math.max(max, day.count), 0))

  function levelFor(count: number): number {
    if (count <= 0 || maxCount.value <= 0) return 0
    const ratio = count / maxCount.value
    if (ratio > 0.75) return 4
    if (ratio > 0.5) return 3
    if (ratio > 0.25) return 2
    return 1
  }

  function cellTitle(day: HeatmapDay | null): string {
    if (!day) return ''
    const date = new Date(`${day.date}T00:00:00Z`)
    const label = `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}`
    const points = day.count === 1 ? 'point' : 'Visits'
    return `${label} - ${day.count} ${points}`
  }

  // Solves one cell size against the module's own box in both axes — whichever
  // dimension is tighter wins — so the full year fits the panel it is dropped
  // into without scrolling, at any panel proportion.
  function recomputeCellSize() {
    const container = rootRef.value?.parentElement
    if (!container) return
    const availableWidth = container.clientWidth
    const availableHeight = container.clientHeight
    if (availableWidth <= 0 || availableHeight <= 0) return

    const groups = monthGroups.value
    // A row of three months is as tall as its tallest month.
    let tallestWeeksTotal = 0
    for (let start = 0; start < groups.length; start += COLUMNS) {
      const row = groups.slice(start, start + COLUMNS)
      tallestWeeksTotal += Math.max(...row.map((group) => group.weeks.length))
    }
    const rowsCount = Math.ceil(groups.length / COLUMNS)

    const heightUnits =
      WEEKDAY_HEADER_RATIO + GAP_RATIO
      + tallestWeeksTotal * (1 + GAP_RATIO)
      + Math.max(0, rowsCount - 1) * GROUP_GAP_RATIO
    const monthUnits = LABEL_COLUMN_RATIO + GAP_RATIO + 7 + 6 * GAP_RATIO
    const widthUnits = COLUMNS * monthUnits + (COLUMNS - 1) * COLUMN_GAP_RATIO

    const solved = Math.min(availableHeight / heightUnits, availableWidth / widthUnits)
    const clamped = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, solved))

    cellSize.value = Math.round(clamped * 10) / 10
    gapSize.value = Math.max(1, clamped * GAP_RATIO)
    groupGap.value = clamped * GROUP_GAP_RATIO
    columnGap.value = clamped * COLUMN_GAP_RATIO
    labelColumnWidth.value = clamped * LABEL_COLUMN_RATIO
  }

  onMounted(async () => {
    await loadHeatmapSummary()
    recomputeCellSize()
    if (rootRef.value?.parentElement) {
      resizeObserver = new ResizeObserver(() => recomputeCellSize())
      resizeObserver.observe(rootRef.value.parentElement)
    }
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  // A late summary changes the week count (and so the solved cell size).
  watch(monthGroups, recomputeCellSize)
</script>

<style scoped lang="scss">
  .th-root {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  // Three months per row; each row is as tall as its tallest month, and the
  // header row repeats once per column so MO–SU sits above every month stack.
  .th-grid {
    display: grid;
    grid-template-columns: repeat(3, max-content);
    justify-content: center;
    align-items: start;
    column-gap: var(--th-column-gap);
    row-gap: var(--th-group-gap);
  }

  // Reads left-to-right, MO first, aligned over the day columns below it.
  .th-weekday-header {
    display: flex;
    gap: var(--th-gap);
    margin-bottom: calc(var(--th-gap) - var(--th-group-gap));
    // Offset past the month-label column so MO sits over the Monday column.
    margin-left: calc(var(--th-label-column) + var(--th-gap));
    font-family: 'Mono';
    font-size: calc(var(--th-cell) * 0.55);
    line-height: calc(var(--th-cell) * 0.7);
    letter-spacing: 0.5px;
    color: #6a6a6a;
  }

  .th-weekday-label {
    width: var(--th-cell);
    text-align: center;
  }

  .th-month-group {
    display: flex;
    flex-direction: row;
    gap: var(--th-gap);
  }

  // One letter per line, upright — a vertical spine down the left of the
  // month's rows rather than sideways text.
  .th-month-label {
    width: var(--th-label-column);
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-family: 'Mono';
    font-size: calc(var(--th-cell) * 0.65);
    line-height: 1;
    letter-spacing: 1px;
    color: #6a6a6a;
  }

  .th-month-weeks {
    display: flex;
    flex-direction: column;
    gap: var(--th-gap);
  }

  .th-week-row {
    display: flex;
    gap: var(--th-gap);
  }

  .th-cell {
    width: var(--th-cell);
    height: var(--th-cell);
    border-radius: 3px;
    background: #1c1c1c;
  }

  // Padding cell for days outside the month, kept only to hold column alignment.
  .th-cell--empty {
    background: transparent;
  }

  .th-level-1 { background: color-mix(in srgb, var(--accent) 25%, #1c1c1c); }
  .th-level-2 { background: color-mix(in srgb, var(--accent) 50%, #1c1c1c); }
  .th-level-3 { background: color-mix(in srgb, var(--accent) 75%, #1c1c1c); }
  .th-level-4 { background: var(--accent); }
</style>
