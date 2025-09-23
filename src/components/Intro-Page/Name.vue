<template>
  <div class="container">
    <div class="name-container">

      <div class="first-name">
        <p v-for="(letter, index) in firstName" :key="index" ref="firstNameRef" class="letter">
          {{ letter }}
        </p>
      </div>

      <div class="last-name">
        <p v-for="(letter, index) in lastName" :key="index" ref="lastNameRef" class="letter">
          {{ letter }}
        </p>
      </div>

      <div class="name-underline"></div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { firstName, lastName, InitializeFloatingElements, firstNameRef, lastNameRef, InitializeTilt } from '../../modules/Name';

InitializeTilt();
InitializeFloatingElements();
</script>

<style lang="scss">
@use "@/style/Intro-Page/name.scss" as *;
</style>
