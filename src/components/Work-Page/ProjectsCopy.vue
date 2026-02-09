<template>
    <div class="copy-container" :class="{ active: activeProjectIndex !== null }">
        <div class="project-copy"
            :class="{ active: activeProjectIndex !== null }"
            @click="closeActiveProject($event)">

            <span :class="{ active: activeProjectIndex !== null }" v-html="currentProject.name" class="p-name"></span>
            <span :class="{ active: activeProjectIndex !== null }" v-if="!currentProject.wip" class="year">{{ currentProject.year }}</span>
            <span :class="{ active: activeProjectIndex !== null }" v-if="currentProject.wip" class="wip">
                <span>WORK IN PROGRESS <br> </span>
                <span class="estimated" :class="{ active: activeProjectIndex !== null }">Estimated {{ currentProject.estimated }}</span>
            </span>

            <Transition name="notice-fade">
                <p :class="{clicked: clicked}"
                   v-if="currentProject.ai && activeProjectIndex !== null"
                   class="notice active">Visual concept generated with AI tools and refined using assets from the original game.</p>
            </Transition>
            <div class="project-image" :style="{ backgroundImage: `url(${currentProject.img})` }"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { projects, currentProjectIndex, activeProjectIndex, closeActiveProject } from '../../modules/projects';
import { clicked } from '../../modules/techContainer';
import { computed } from 'vue';

const currentProject = computed(() => projects[currentProjectIndex.value]);
</script>


<style lang="scss" scoped>
@use "../../style/Work-Page/projectscopy.scss";
</style>
