<template>
	<div class="description-grid" :class="{ clicked: clicked, mobileImage: projects[currentProjectIndex].mobileImage }">
		<div class="div3" :class="{ clicked: clicked, mobileImage: projects[currentProjectIndex].mobileImage }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image1})` }"></div>
		<div class="div1" :class="{ clicked: clicked, mobileImage: projects[currentProjectIndex].mobileImage }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image2})` }"></div>
		<div class="div2" :class="{ clicked: clicked, mobileImage: projects[currentProjectIndex].mobileImage }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image3})` }"></div>
		<div class="div4" :class="{ clicked: clicked, mobileImage: projects[currentProjectIndex].mobileImage }"
			:style="{ backgroundImage: `url(${projects[currentProjectIndex].image4})` }"></div>
	</div>
</template>

<script lang="ts" setup>
	import { currentProjectIndex, projects } from '../../../../modules/3 Work Page/work-projects';
	import { clicked } from '../../../../modules/3 Work Page/work-tech-container';
</script>

<style lang="scss" scoped>
	@use "@/style/3-Work-Page/contentimagegrid.scss" as *;
</style>