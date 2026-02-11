<template>
  <div class="profile-section-container">
    <div class="profile-section-content">
      <Cards />
      <Contact />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Cards from '@profile/Profile-Cards.vue';
  import Contact from '@profile/Profile-Contact.vue';

  import { onMounted } from 'vue';
  import { ProfileAnimationDesktop } from '@modules/animations/Desktop/Profile-Animation-Handler';


  onMounted(() => {
    ProfileAnimationDesktop();
  })
</script>

<style lang="scss" scoped>
  .profile-section-container {
    position: absolute;
    top: 100vh;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .profile-section-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateY(-100vh);
  }

  .info-scroller-top {
    position: absolute;
    top: 0;
  }

  .info-scroller-bottom {
    position: absolute;
    top: 100vh;
  }

</style>
