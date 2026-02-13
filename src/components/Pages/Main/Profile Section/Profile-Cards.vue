<template>
  <div class="container">
    <div class="cards-container">
      <div v-for="(card, i) in cards" :key="i" :class="[card.class, { [card.openClass]: card.open.value }]"
        @click="card.toggle">
        <span>{{ card.label }}</span>
        <div :class="['card-content', { visible: card.open.value }]"> {{ card.content }}
          <span>{{ card.label }}</span>
        </div>
      </div>
      <div v-for="(card, i) in cards" :key="'back-' + i" :class="card.backClass"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { cards } from '@profileModules/profile-cards';
</script>

<style lang="scss" scoped>
  @use "@styleVariables" as *;
  @use "@profileStyle/profile-cards.scss" as *;

  .container {
    z-index: 1000;
  }
</style>
