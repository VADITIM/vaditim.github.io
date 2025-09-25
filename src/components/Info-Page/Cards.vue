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
import { cards } from '../../modules/cards';
import { CardsAnimations, BackCardsAnimations} from '../../modules/card-animations';
import { onMounted } from 'vue';

onMounted(() => {
  CardsAnimations();
  BackCardsAnimations();

})

</script>

<style lang="scss" scoped>
@use "@/style/Info-Page/cards.scss" as *;
</style>
