<template>
  <div class="about-me-header-container">
    <p class="about-me-header">ABOUT ME</p>
  </div>
</template>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;


.about-me-header-container {
  display: flex;
  position: fixed;
  top: 1%;
  left: 120%;
  width: 10%;
  font-size: 5rem;
  font-family: Wosker;
  perspective: 1000px;
  z-index: 20;
  gap: 0;
  text-wrap: nowrap;
}

.about-me-header {
  @include rotate(0, 40, 0);
	@include outline(black);
	color: $red;
  position: relative;
  min-width: 100%;

  @include mobile {
    font-size: 2.4rem;
  }
}

</style>
