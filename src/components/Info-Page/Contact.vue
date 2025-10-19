<template>
  <div class="contact-container">
    <div class="github">
    </div>
    <span>GitHub</span>
    <div class="telegram">
    </div>
    <span>Telegram</span>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
@use "../../style/variables.scss" as *;

.contact-container {
  @extend .center;
  @include absoluteCenter(50%, 120%);
  flex-direction: column;
  width: 10rem;
  height: 25rem;
  perspective: 1000px;
  border-radius: 5rem;
  background-color: $lightblacktrans;
  background-color: #473622a2;
  filter: drop-shadow(10px -10px 15px #c79152a2);
  border-top: 5px solid #f09b3a;
  border-right: 5px solid #f09b3a;

  &>span {
    position: relative;
    top: -5%;
    width: fit-content;
    height: fit-content;
    font-family: Exo;
    font-size: 1.2rem;
  }

  &>div {
    width: 5rem;
    height: 5rem;
    margin: 2rem 0rem;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  @include mobile {
    @include absoluteCenter(85%, 120%);
    width: 4rem;
    height: 9rem;
    border-top: 2px solid #f09b3a;
    border-right: 2px solid #f09b3a;


    &>div {
      width: 2rem;
      height: 2rem;
      margin: .3rem 0rem;
    }

    &>span {
      font-size: 0.74rem;
      top: -3%;
    }
  }
}

.github {
  @extend .center;
  background-image: url("../../assets/images/icons/github.png");
  background-size: cover;
}

.telegram {
  @extend .center;
  background-image: url("../../assets/images/icons/telegram.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
