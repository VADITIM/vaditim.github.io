<template>
  <div class="contact-container">
      <a class="github" href="https://github.com/VADITIM" target="_blank" rel="noopener noreferrer"></a>
    <span>GitHub</span>
      <a class="telegram" href="https://t.me/VADITIMx" target="_blank" rel="noopener noreferrer"></a>
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
  width: 20rem;
  height: 35rem;
  perspective: 1000px;
  border-radius: 5rem;
  // background-color: #473622a2;
  // filter: drop-shadow(10px -10px 15px #c79152a2);
  // border-top: 5px solid #f09b3a;
  // border-right: 5px solid #f09b3a;

  &>span {
    position: relative;
    top: -5%;
    width: fit-content;
    height: fit-content;
    font-family: Exo;
    font-size: 1.5rem;
  }

  &>a {
    width: 10rem;
    height: 10rem;
    margin: 2rem 0rem;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
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

.github, .telegram {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  transform: translateZ(0); 
  filter: drop-shadow(0px 0px 35px #ffffffa2);

}

.github {
  background-image: url("../../assets/images/icons/github.png");
}

.telegram {
  background-image: url("../../assets/images/icons/telegram.png");

}
</style>
