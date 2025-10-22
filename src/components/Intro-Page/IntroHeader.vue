<template>
  <div class="intro-header-container">
    <p class="intro-header">ROLES</p>
  </div>
</template>

<style scoped lang="scss">
@use "../../style/variables.scss" as *;

.intro-header-container {
  display: flex;
  position: fixed;
  top: 1%;
  left: 1%;
  width: 10%;
  font-size: 5rem;
  font-family: Wosker;
  perspective: 1000px;
  z-index: 20;
  gap: 0;

  transition: 
    .3s all
}

.intro-header {
  @include rotate(0, 40, 0);
	@include outline(black);
	color: $red;
  position: relative;
  min-width: 100%;
}
</style>