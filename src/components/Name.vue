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

import VanillaTilt from 'vanilla-tilt';
import { ref, onMounted } from 'vue';

const firstNameRef = ref<HTMLElement>();
const lastNameRef = ref<HTMLElement>();

const firstName: string[] = ['v', 'a', 'd', 'i', 'm'];
const lastName: string[] = ['n', 'i', 'e', 'd', 'e', 'n', 't', 'a', 'l']


onMounted(() => {
  if (firstNameRef.value) {
    VanillaTilt.init(firstNameRef.value, {
      max: 50,
      speed: 900
    })
  }
  if (lastNameRef.value) {
    VanillaTilt.init(lastNameRef.value, {
      max: 50,
      speed: 900
    })
  }
})
</script>

<style lang="scss">
@use "../style/name.scss" as *;
</style>