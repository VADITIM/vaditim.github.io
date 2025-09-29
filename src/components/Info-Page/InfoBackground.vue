<template>
    <div class="backgroundInfoBottom"></div>
    <div class="backgroundInfoTop"></div>

    <div class="intro-background"></div>
    
    <div class="work-background-bottom"></div>
    <div class="work-background-top"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ScrollWorkPage } from "../../modules/animations/background/work-page-background-scroller";

onMounted(() => {
    ScrollWorkPage();
})
</script>

<style lang="scss" scoped>
@use "../../style/Info-Page/Infobackground.scss" as *;
</style>