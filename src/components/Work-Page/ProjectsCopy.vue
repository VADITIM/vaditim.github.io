<template>
    <div class="copy-container" :class="{ active: activeProjectIndex !== null }">
        <div class="project-copy" :class="{ active: activeProjectIndex !== null, cursor: clicked }" @click="closeActiveProject($event)">
        <DescriptionGrid />

        <h3 :class="{ active: activeProjectIndex !== null }" v-html="projects[currentProjectIndex]?.name"></h3>
        <span :class="{ active: activeProjectIndex !== null }" v-if="!projects[currentProjectIndex]?.wip">Year <br> {{
            projects[currentProjectIndex]?.year }}</span>
        <span :class="{ active: activeProjectIndex !== null }" v-if="projects[currentProjectIndex]?.wip">
            <span>WORK IN PROGRESS <br> </span>
            <span>Estimated {{ projects[currentProjectIndex]?.estimated }}</span>
        </span>
        
        <Transition name="notice-fade">
            <p :class="{clicked: clicked}" v-if="projects[currentProjectIndex]?.ai && activeProjectIndex !== null" class="notice active">Visual concept generated with AI tools and refined using assets from the original game.</p>
        </Transition>
        <div class="project-image" :style="{ backgroundImage: `url(${projects[currentProjectIndex]?.img})` }"
            :class="{ current: currentProjectIndex === currentProjectIndex, transitioning: transitioning }"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import DescriptionGrid from './ContentImageGrid.vue';
import { projects, currentProjectIndex, activeProjectIndex, closeActiveProject, transitioning} from '../../modules/projects';
import { clicked } from '../../modules/techContainer';
</script>


<style lang="scss" scoped>
@use "../../style/Work-Page/projectscopy.scss"
</style>
