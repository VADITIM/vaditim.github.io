<template>
  <div class="container">
    <div class="name-container">
      <div class="first-name">
        <div v-for="(letter, index) in firstName" :key="index" ref="firstNameRef" class="letter">
          {{ letter }}
        </div>
      </div>
      <div class="last-name">
        <div v-for="(letter, index) in lastName" :key="index" ref="lastNameRef" class="letter">
          {{ letter }}
        </div>
      </div>
      <div class="name-underline"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { firstName, lastName, InitializeFloatingElements, tilts } from '@modules/Sections/Perks Section/perks-name';
  import { InitializeTilt } from '@modules/Misc/vanilla-tilt';

  InitializeFloatingElements();
  InitializeTilt(tilts);
</script>

<style lang="scss">
  @use "@styleVariables" as *;
  @use "@perksStyle/perks-name.scss" as *;
</style>
