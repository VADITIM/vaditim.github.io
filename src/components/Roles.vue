<template>
	<div class="container">
		<div class="background"></div>

		<div class="skills-container" ref="skillRef">
			<div class="skills-line"></div>
			<div class="options-container">
				<div v-for="(skill, index) in skills" :key="index" class="skill" :class="{ open: isOpen(skill.name) }"
					@click="toggle(skill.name)" v-if="isOpen">
					<span class="skill-title"> {{ skill.name }} </span>

					<div class="skill-options-container">
						<div v-for="id in skill.id" :key="id" class="skill-option">
							{{ GetOptionName(id) }}
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { skills, GetOptionName } from '../modules/roles';
import { toggle, isOpen, closeAll } from '../modules/mobile-hover';

const skillRef = ref<HTMLElement | null>(null)

function onPointerDownOutside(e: PointerEvent) {
	const target = e.target as HTMLElement | null
	if (!target) return
	const openSkill = target.closest('.skill.open')
	if (!openSkill) {
		closeAll()
	}
}

onMounted(() => document.addEventListener('pointerdown', onPointerDownOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDownOutside))

</script>

<style lang="scss" scoped>
@use "../style/roles.scss" as *;
</style>