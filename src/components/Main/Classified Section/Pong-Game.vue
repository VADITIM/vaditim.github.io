<template>
  <!-- Canvas pong against a simple ball-tracking AI. The loop only runs while
       the classified section is active (started/stopped from section enter/
       leave) so it costs nothing in every other section. -->
  <div class="pong">
    <div class="pong-score">
      <span class="pong-score-value">{{ playerScore }}</span>
      <span class="pong-score-divider">·</span>
      <span class="pong-score-value">{{ aiScore }}</span>
    </div>
    <div class="pong-rally">BEST RALLY: {{ bestRally }}</div>
    <div class="pong-stage">
      <canvas
        ref="canvasRef"
        class="pong-canvas"
        @pointermove="handlePointerMove"
      ></canvas>
      <button v-if="!hasStarted" class="pong-start" @click="handleStartClick">START</button>
      <button v-else-if="awaitingContinue" class="pong-start" @click="handleContinueClick">CONTINUE</button>
    </div>
    <div class="pong-hint">move your cursor over the field to play</div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  const BEST_RALLY_STORAGE_KEY = 'pong-best-rally'

  const CANVAS_WIDTH = 720
  const CANVAS_HEIGHT = 400
  const PADDLE_WIDTH = 9
  const PADDLE_HEIGHT = 58
  const PADDLE_MARGIN = 12
  const BALL_SIZE = 8
  const BALL_START_SPEED = 4.2
  const BALL_SPEED_GAIN = 1.04
  const BALL_MAX_SPEED = 11
  const AI_MAX_SPEED = 2.04
  const ACCENT = '#8a2be2'
  const FOREGROUND = '#e8e8e8'

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const playerScore = ref(0)
  const aiScore = ref(0)
  const hasStarted = ref(false)
  const awaitingContinue = ref(false)
  const bestRally = ref(Number(localStorage.getItem(BEST_RALLY_STORAGE_KEY)) || 0)

  let context: CanvasRenderingContext2D | null = null
  let animationFrameId = 0
  let running = false
  // The opening ball of every rally (after START / CONTINUE) always goes to the
  // AI, and the AI is guaranteed to defend it; cleared once it hits it back.
  let isFirstShot = false
  // Counts paddle hits since the last serve; persisted as a high score once a
  // point ends the rally.
  let currentRally = 0

  const playerPaddle = { y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2 }
  const aiPaddle = { y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2 }
  const ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, velocityX: BALL_START_SPEED, velocityY: 2 }

  // Every serve heads toward the AI (positive X) and is the "first shot" the AI
  // is guaranteed to reach; the player always opens the rally.
  function serveBall() {
    ball.x = CANVAS_WIDTH / 2
    ball.y = CANVAS_HEIGHT / 2
    ball.velocityX = BALL_START_SPEED
    ball.velocityY = (Math.random() * 2 - 1) * 3
    isFirstShot = true
  }

  function handlePointerMove(event: PointerEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const bounds = canvas.getBoundingClientRect()
    const relativeY = ((event.clientY - bounds.top) / bounds.height) * CANVAS_HEIGHT
    playerPaddle.y = Math.min(Math.max(relativeY - PADDLE_HEIGHT / 2, 0), CANVAS_HEIGHT - PADDLE_HEIGHT)
  }

  function updateAi() {
    const paddleCenter = aiPaddle.y + PADDLE_HEIGHT / 2
    // Only chase while the ball travels toward the AI; drifting back to
    // center otherwise keeps it beatable.
    const target = ball.velocityX > 0 ? ball.y : CANVAS_HEIGHT / 2
    const distance = target - paddleCenter
    // The opening shot is always defended: track it with no speed cap so the
    // paddle can't be aced off the serve. Normal rallies stay capped.
    const step = isFirstShot ? distance : Math.min(Math.max(distance, -AI_MAX_SPEED), AI_MAX_SPEED)
    aiPaddle.y += step
    aiPaddle.y = Math.min(Math.max(aiPaddle.y, 0), CANVAS_HEIGHT - PADDLE_HEIGHT)
  }

  function bounceOffPaddle(paddleY: number, direction: 1 | -1) {
    const hitOffset = (ball.y - (paddleY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)
    const speed = Math.min(Math.hypot(ball.velocityX, ball.velocityY) * BALL_SPEED_GAIN, BALL_MAX_SPEED)
    const bounceAngle = hitOffset * (Math.PI / 3.4)
    ball.velocityX = Math.cos(bounceAngle) * speed * direction
    ball.velocityY = Math.sin(bounceAngle) * speed
  }

  function updateBall() {
    ball.x += ball.velocityX
    ball.y += ball.velocityY

    if (ball.y <= BALL_SIZE / 2 || ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
      ball.velocityY *= -1
      ball.y = Math.min(Math.max(ball.y, BALL_SIZE / 2), CANVAS_HEIGHT - BALL_SIZE / 2)
    }

    const playerEdge = PADDLE_MARGIN + PADDLE_WIDTH
    if (
      ball.velocityX < 0 &&
      ball.x - BALL_SIZE / 2 <= playerEdge &&
      ball.x - BALL_SIZE / 2 >= PADDLE_MARGIN - BALL_SIZE &&
      ball.y >= playerPaddle.y && ball.y <= playerPaddle.y + PADDLE_HEIGHT
    ) {
      ball.x = playerEdge + BALL_SIZE / 2
      bounceOffPaddle(playerPaddle.y, 1)
      currentRally += 1
    }

    const aiEdge = CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH
    if (
      ball.velocityX > 0 &&
      ball.x + BALL_SIZE / 2 >= aiEdge &&
      ball.x + BALL_SIZE / 2 <= aiEdge + PADDLE_WIDTH + BALL_SIZE &&
      ball.y >= aiPaddle.y && ball.y <= aiPaddle.y + PADDLE_HEIGHT
    ) {
      ball.x = aiEdge - BALL_SIZE / 2
      bounceOffPaddle(aiPaddle.y, -1)
      isFirstShot = false
      currentRally += 1
    }

    if (ball.x < -BALL_SIZE) {
      aiScore.value += 1
      pauseForContinue()
    } else if (ball.x > CANVAS_WIDTH + BALL_SIZE) {
      playerScore.value += 1
      pauseForContinue()
    }
  }

  // After every point: freeze the game and wait for the player to confirm
  // before the next serve (always re-served toward the AI on CONTINUE).
  function pauseForContinue() {
    if (currentRally > bestRally.value) {
      bestRally.value = currentRally
      localStorage.setItem(BEST_RALLY_STORAGE_KEY, String(bestRally.value))
    }
    currentRally = 0
    serveBall()
    stop()
    draw()
  }

  function draw() {
    if (!context) return
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Center dashed line
    context.strokeStyle = 'rgba(138, 43, 226, 0.35)'
    context.lineWidth = 2
    context.setLineDash([6, 8])
    context.beginPath()
    context.moveTo(CANVAS_WIDTH / 2, 0)
    context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    context.stroke()
    context.setLineDash([])

    context.fillStyle = ACCENT
    context.fillRect(PADDLE_MARGIN, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)
    context.fillStyle = FOREGROUND
    context.fillRect(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

    context.fillStyle = FOREGROUND
    context.shadowColor = ACCENT
    context.shadowBlur = 10
    context.fillRect(ball.x - BALL_SIZE / 2, ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE)
    context.shadowBlur = 0
  }

  function frame() {
    if (!running) return
    updateAi()
    updateBall()
    draw()
    animationFrameId = requestAnimationFrame(frame)
  }

  function handleStartClick() {
    hasStarted.value = true
    serveBall()
    start()
  }

  function handleContinueClick() {
    awaitingContinue.value = false
    serveBall()
    start()
  }

  // Resumes the loop on section enter; but only once the player has pressed
  // START, and never while a point pause is waiting on CONTINUE.
  function start() {
    if (running || !hasStarted.value || awaitingContinue.value) return
    running = true
    animationFrameId = requestAnimationFrame(frame)
  }

  // Any stop mid-game (point, section leave, unmount) parks the game on the
  // CONTINUE prompt so it never resumes without the player.
  function stop() {
    running = false
    cancelAnimationFrame(animationFrameId)
    if (hasStarted.value) awaitingContinue.value = true
  }

  defineExpose({ start, stop })

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    context = canvas.getContext('2d')
    serveBall()
    draw()
  })

  onBeforeUnmount(stop)
</script>

<style scoped lang="scss">
  .pong {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .pong-score {
    font-family: 'Audiowide';
    font-size: 15px;
    letter-spacing: 6px;
    color: #e8e8e8;
  }

  .pong-score-divider {
    color: #8a2be2;
    margin: 0 4px;
  }

  .pong-rally {
    font-family: 'Mono';
    font-size: 10px;
    letter-spacing: 3px;
    color: #8a2be2;
  }

  .pong-stage {
    position: relative;
    width: 100%;
  }

  .pong-start {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Audiowide';
    font-size: 14px;
    letter-spacing: 6px;
    color: #e8e8e8;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(138, 43, 226, 0.6);
    border-radius: 4px;
    padding: 12px 28px;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;

    &:hover,
    &:focus-visible {
      background: rgba(138, 43, 226, 0.25);
      box-shadow: 0 0 14px rgba(138, 43, 226, 0.5);
    }
  }

  .pong-canvas {
    display: block;
    width: 100%;
    aspect-ratio: 720 / 400;
    border: 1px solid rgba(138, 43, 226, 0.4);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.35);
    cursor: crosshair;
    touch-action: none;
  }

  .pong-hint {
    font-family: 'Mono';
    font-size: 10px;
    letter-spacing: 3px;
    color: #9a9a9a;
    text-transform: uppercase;
  }
</style>
