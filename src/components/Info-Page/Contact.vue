<template>
  <div class="contact-container">
    <div class="github"></div>
    <div class="telegram"></div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.contact-container {
  @extend .center;
  @include absoluteCenter(50%, 20%);
  flex-direction: column;
  width: 10rem;
  height: 25rem;
  perspective: 1000px;
  background-color: red;
  
  &>* {
    width: 7rem;
    height: 7rem;
    border-radius: 50%;
    margin: 2rem 0rem;
    cursor: pointer;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

.github {
  @extend .center;
  background-color: blue;
}

.telegram {
  @extend .center;
  background-color: green;
}

</style>
