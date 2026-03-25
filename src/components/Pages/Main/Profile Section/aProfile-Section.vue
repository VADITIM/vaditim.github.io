<template>
  <div class="profile-section-container">
      <Cards />
      <Contact />
    </div>
</template>

<script setup lang="ts">
  import Cards from '@profile/Profile-Cards.vue';
  import Contact from '@profile/Profile-Contact.vue';
</script>

<style lang="scss" scoped>
  .profile-section-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    transform: translateY(-100vh);
    overflow: hidden;
  }
</style>
