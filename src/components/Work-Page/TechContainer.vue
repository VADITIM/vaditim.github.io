<template>
    <div class="tech-container">
			<div class="dev-container">
				<div class="platform" :style="{ backgroundImage: `url(${projects[currentProjectIndex || 0].platform})` }"></div>
				<div class="engine" :style="{ backgroundImage: `url(${projects[currentProjectIndex || 0].engine})` }"></div>
				<div class="language" :style="{ backgroundImage: `url(${projects[currentProjectIndex || 0].language})` }"></div>
			</div>
      <div class="download"></div>
    </div>
</template>

<script setup lang="ts">
import { currentProjectIndex, projects } from '../../modules/projects';
</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.tech-container {
  @extend .center;
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 128, 0, 0.322);
  width: 40rem;
  height: 30rem;
  z-index: 5;
}

.dev-container {
	position: absolute;
	right: 0;
	margin: 2rem;
  filter: drop-shadow(0px 0px 30px black);
	perspective: 1000px;
}

.engine,
.platform,
.language {
	@include rotate(-10, -20, 0);
  position: relative;
  top: 0;
  left: 0;
  width: 6rem;
  height: 6rem;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
	margin: 1rem;
}

.download {
	position: absolute;
  top: 70%;
  left: 15%;
  width: 6.5rem;
  height: 6.5rem;
	background-image: url("../../assets/images/download.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0px 0px 30px rgb(121, 121, 121));
}

</style>


