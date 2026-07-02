<template>
  <Name />
  <Roles />
  <div class="wip">WIP</div>
</template>

<script setup lang="ts">
  import Roles from '@components/Main/Perks Section/Skills-Display.vue'
  import Name from '@components/Main/Perks Section/Name-Display.vue'
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;

  .wip {
    position: fixed;
    bottom: 1%;
    right: 1%;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    font-family: "Cutive";
    z-index: 1000;
    overflow: hidden;
  }
</style>
