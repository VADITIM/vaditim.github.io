<template>
  <div class="name-headline-container">
    <div class="name">VADIM</div>
  </div>
  <div class="about-me-container">
    <div class="about-me">About Me</div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.name-headline-container {
  position: fixed;
  margin: 0rem 2rem;
  top: 0;
  left: 130%;
  width: 4rem;
  height: 4rem;
  perspective: 1000px;
}

.name {
  @include rotate(0, -260, 0);
  color: red;
  font-family: Exo;
  font-size: 5rem;
  filter: drop-shadow(1px 1px 10px black);

  @include mobile {
    font-size: 2.4rem;
  }
}

.about-me-container {
  @include absoluteCenter(55%, 120%);
  @include rotate(0, 180, 0);
  margin: 2rem 5rem;
  width: 10rem;
  height: 10rem;
  perspective: 1000px;
  font-family: Mono;
  font-size: 5.5rem;

  @include mobile {
    top: 15%;
    left: -120%;
    font-size: 2.4rem;
    text-align: end;
  }

}

.about-me {
  color: red;
  line-height: 1;
  filter: drop-shadow(2px 2px 2px black);

}
</style>
