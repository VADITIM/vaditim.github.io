<template>
  <div class="container">
    <div class="quotes-container">
      <button class="arrow-left" @click="previousQuote"><</button>
          <p class="quotes-text">
            {{ quotes[currentQuoteIndex].text }}
          </p>
          <p class="quotes-author">
            {{ quotes[currentQuoteIndex].author }}
          </p>
          <button class="arrow-right" @click="nextQuote">></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const quotes = [
  {
    text: "Simplicity carried to an extreme becomes elegance.",
    author: "Jon Franklin"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  }
]

const currentQuoteIndex = ref(0);

function nextQuote() {
  currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.length;
}

const previousQuote = () => {
  currentQuoteIndex.value = currentQuoteIndex.value === 0
    ? quotes.length - 1
    : currentQuoteIndex.value - 1;
};
</script>

<style lang="scss" scoped>
@use "../../style/Info-Page/quotes.scss" as *;
</style>
