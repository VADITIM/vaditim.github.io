<template>
    <div class="info-info-background-back"></div>
    <div class="info-info-background-front"></div>

    <div class="info-intro-background"></div>
    
    <div class="info-work-background-front" :class="{active: activeProjectIndex !== null}"></div>
    <div class="info-work-background-back" :class="{active: activeProjectIndex !== null}"></div>
</template>

<script setup lang="ts">
import { activeProjectIndex } from '../../modules/projects';


</script>

<style lang="scss" scoped>
@use "../../style/Info-Page/Infobackground.scss" as *;
</style>