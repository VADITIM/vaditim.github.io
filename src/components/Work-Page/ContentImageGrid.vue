<template>
	<div class="description-grid" :class="{ clicked: clicked }">
		<div class="div3" :class="{ clicked: clicked }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image1})` }"></div>
		<div class="div1" :class="{ clicked: clicked }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image2})` }"></div>
		<div class="div2" :class="{ clicked: clicked }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image3})` }"></div>
		<div class="div4" :class="{ clicked: clicked }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image4})` }"></div>
	</div>
</template>

<script lang="ts" setup>
import { currentProjectIndex, projects } from '../../modules/projects';
import { clicked } from '../../modules/techContainer';
</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/contentimagegrid.scss" as *;
</style>