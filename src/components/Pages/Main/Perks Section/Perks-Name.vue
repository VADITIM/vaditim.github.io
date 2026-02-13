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
import { firstName, lastName, InitializeFloatingElements, tilts } from '@modules/Perks Section/perks-name';
import { InitializeTilt } from '@modules/vanilla-tilt';

InitializeFloatingElements();
InitializeTilt(tilts);
</script>

<style lang="scss">
  @use "@styleVariables" as *;
  @use "@perksStyle/perks-name.scss" as *;
</style>
