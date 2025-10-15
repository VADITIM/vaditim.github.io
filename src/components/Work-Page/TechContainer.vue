<template>
  <div class="tech-container" :class="{active: activeProjectIndex !== null}">
    <div class="dev-container">
      <div class="platform" :style="{ backgroundImage: `url(${projects[currentProjectIndex || 0].platform})` }" :class="{active: activeProjectIndex !== null}"></div>
      <div class="engine" :style="{ backgroundImage: `url(${projects[currentProjectIndex || 0].engine})` }" :class="{active: activeProjectIndex !== null}"></div>
      <div class="language" :style="{ backgroundImage: `url(${projects[currentProjectIndex || 0].language})` }" :class="{active: activeProjectIndex !== null}"></div>
    </div>
    <div class="download"></div>
  </div>

  <div class="description-container" :class="{active: activeProjectIndex !== null}">
    <div class="container">
      <div class="see-more">See More</div>
      <div class="description"> {{ projects[currentProjectIndex || 0].description }} </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentProjectIndex, projects, activeProjectIndex } from '../../modules/projects';
</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.tech-container {
  @extend .center;
  position: absolute;
  bottom: 0;
  right: -50%;
  right: 0%;
  background-color: rgba(0, 128, 0, 0.322);
  width: 25%;
  height: 30%;
  z-index: 5;

  transition: 
    all .3s ease-in-out;

  &.active {
    right: 0%;

    transition: 
      all 1s ease-in-out;
  }
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





.description-container {
  position: absolute;
  top: 5%;
  right: -50%;
  width: 40%;
  height: 40%;
  z-index: 5;
  perspective: 1000px;
  font-family: Exo;
  
  transition: 
    all 1s ease-in-out;

  &.active {
    right: -25%;

    transition: 
      all 1s ease-in-out;

      &:hover {
        right: 5%;
      }
  }
}

.container {
  @include rotate(0, -10, 0);
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background-color: #242424;
  filter: drop-shadow(0px 0px 30px rgb(121, 121, 121));
}

.description {
  position: absolute;
  width: 95%;
  height: 95%;
  top: 0;
  left: -100%;
  text-align: center;
  opacity: 0;
  font-size: 2rem;
  margin: 1rem;

  transition: 
    all .6s ease-in-out;

  .description-container:hover & {
    opacity: 1;
    left: 0;

    transition: 
      all .6s ease-in-out .2s;

  }
}

.see-more {
  @include absoluteCenter(50%, 20%);
  position: absolute;
  text-align: center;
  
  opacity: 1;
  font-size: 4rem;

  transition: 
    all .6s ease-in-out;

  .description-container:hover & {
    @include absoluteCenter(50%, -20%);
    opacity: 0;
  }
}

</style>


