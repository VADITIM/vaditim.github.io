<template>
	<div class="intro-background"></div>
	<div class="info-background-back"></div>
	<div class="info-background-front"></div>
	<div class="work-background-back" :class="{active: activeProjectIndex !== null}"></div>
	<div class="work-background-front" :class="{active: activeProjectIndex !== null}"></div>

	<div class="scrollerBackgrounds"></div>
	<div class="scrollerBackgrounds2"></div>
</template>

<script setup lang="ts" >
import { onMounted } from 'vue';
import { ScrollBackgroundSections } from '../modules/animations/sectionBackgrounds';
import { activeProjectIndex } from '../modules/projects';

onMounted(() => {
  ScrollBackgroundSections();
})
</script>

<style lang="scss">
@use "../style/variables.scss" as *;

.scrollerBackgrounds {
	position: absolute;
	bottom: -100%;
}

.scrollerBackgrounds2 {
	position: absolute;
	bottom: 0%;
}



.intro-background {
	position: absolute;
  top: 0;
	left: 20%;
	width: 100%;
	height: 300vh;
	background-color: rgb(255, 221, 28);
  background: #FFDD1B;
  background: linear-gradient(180deg,rgba(255, 221, 27, 1) 0%, rgba(102, 89, 22, 1) 100%);
	clip-path: polygon(0 0, 100% 0, 10% 100%, 0% 100%);
	z-index: 1;

	transition: $backgroundTransitionTime all ease;

	@include tablet {
		top: 0;
		width: 30%;
	}

	@include mobile {
		top: 0;
		width: 40%;
	}
}



.info-background-front {
  position: absolute;
  left: -20%;
  width: 20%;
  height: 300vh;
  background-color: blue;
  background: linear-gradient(180deg,rgba(0, 64, 255, 1) 15%, rgba(17, 56, 89, 1) 85%);
	clip-path: polygon(0 0, 100% 0, 0 100%, 0% 100%);
	z-index: 2;

	transition: $backgroundTransitionTime all ease;

  @include tablet {
    width: 20%;
  }

  @include mobile {
    width: 30%;
    left: -100%;
  }
}

.info-background-back {
  position: absolute;
  left: -20%;
  width: 20%;
  height: 300vh;
  background-color: rgb(24, 24, 177);
  background: linear-gradient(180deg,rgba(0, 30, 255, 1) 15%, rgba(17, 56, 89, 1) 85%);
	clip-path: polygon(0 0, 19% 0, 83% 100%, 0 100%);
	z-index: 2;
	
	transition: $backgroundTransitionTime all ease;

  @include tablet {
    width: 30%;
  }

  @include mobile {
    width: 30%;
  }
}


.work-background-back {
  position: absolute;
  right: -30%;
  width: 15%;
  height: 300vh;
  background-color: rgb(134, 12, 12);
  background: linear-gradient(180deg,rgba(51, 8, 8, 1) 21%, rgba(102, 14, 14, 1) 80%, rgba(134, 12, 12, 1) 100%);
	clip-path: polygon(100% 0, 100% 0, 100% 100%, 0 100%);
	z-index: 3;
	
	transition: $backgroundTransitionTime all ease;

  &.active {
    width: 25%;
    transition: .4s all;
  }

  @include mobile {
    width: 30%;
  }

  @include tablet {
    width: 30%;
    right: -30%;
  }
}

.work-background-front {
  position: absolute;
  right: -30%;
  width: 30%;
  height: 300vh;
  background-color: $red;
  background: linear-gradient(180deg,rgba(105, 17, 34, 1) 21%, rgba(153, 9, 38, 1) 55%, rgba(220, 20, 60, 1) 100%);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 81% 100%);
	z-index: 3;
	
	transition: $backgroundTransitionTime all ease;

  &.active {
		width: 50%;
		transition: .5s all .2s;
  }

  @include mobile {
    width: 19.5%;
    right: -40%;
  }

  @include tablet {
    width: 19.5%;
    right: -30%;
  }
}


</style>