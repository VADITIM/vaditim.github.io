<template>
  <div class="wid"> </div>
  <Name />
  <Roles />
</template>

<script setup lang="ts">
import Roles from './Roles.vue'
import Name from './Name.vue'


</script>

<style lang="scss" scoped>
@import "../style/style.scss";
@import "../style/variables.scss";

.wid {
  width: 100%;
  height: 2rem;
  position: fixed;
  top: 2%;
  justify-content: center;
  display: flex;
  font-size: 2rem;
  align-items: center;
  left: 50%;
  transform: translate(-50%, -50%);


  &::before {
    content: "desktop"; // Default content

    @include mobile {
      content: "mobile";
      color: red;
    }

    @include tablet {
      content: "tablet";
      color: orange;
    }

    @include smallDesktop {
      content: "small-desktop";
      color: yellow;
    }

    @include desktop {
      content: "desktop";
      color: green;
    }
  }
}
</style>
