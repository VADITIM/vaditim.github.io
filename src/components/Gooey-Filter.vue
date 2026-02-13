<template>
	<svg style="position: absolute; width: 0; height: 0;">
		<defs>
			<filter id="gooey-filter">
				<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
				<feColorMatrix in="blur" mode="matrix" values="
					1 0 0 0 0
					0 1 0 0 0
					0 0 1 0 0
					0 0 0 18 -7
				" result="gooey" />
				<feComposite in="SourceGraphic" in2="gooey" operator="atop" />
			</filter>
		</defs>
	</svg>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;
</style>