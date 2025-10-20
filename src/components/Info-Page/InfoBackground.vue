<template>
    <div class="info-info-background-back"></div>
    <div class="info-info-background-front"></div>

    <div class="info-intro-background"></div>
    
    <div class="info-work-background-front" :class="{active: activeProjectIndex !== null}"></div>
    <div class="info-work-background-back" :class="{active: activeProjectIndex !== null}"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { activeProjectIndex } from '../../modules/projects';
import { ScrollInfoPage } from '../../modules/animations/background/info-page-background-scroller';

onMounted(() => {
  ScrollInfoPage();
})
</script>

<style lang="scss" scoped>
@use "../../style/Info-Page/Infobackground.scss" as *;
</style>