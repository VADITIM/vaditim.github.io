<template>
	<div class="container">
		<div class="background"></div>

		<div class="skills-container">
			<div class="skills-line"></div>
			<div class="options-container">
				<div v-for="(skill, index) in skills" :key="index" class="skill">
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
import { skills, GetOptionName } from '../modules/roles';
</script>

<style lang="scss" scoped>
@import "../style/roles.scss";
</style>