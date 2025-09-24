import { container } from '../../modules/scroll-snapping';
<template>
  <div class="name-headline-container">
    <div class="name">VADIM</div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.name-headline-container {
  position: fixed;
  margin: 2rem 5rem;
  top: 0;
  left: 100%;
  width: 4rem;
  height: 4rem;
  perspective: 1000px;
}

.name {
  @include rotate(0, -230, 0);
  color: red;
  font-family: DT;
  font-size: 3rem;
}
</style>
