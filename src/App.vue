<template>
  <main class="app-container" ref="container">
    <IntroPage />
    <InfoPage />
    <WorkPage />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import IntroPage from './components/IntroPage.vue'
import InfoPage from './components/InfoPage.vue'
import WorkPage from './components/WorkPage.vue'

const container = ref<HTMLElement>()

const snapToNearest = () => {
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  const proximityDistance = 200

  const sections = document.querySelectorAll('.app-container > *')

  sections.forEach((section, index) => {
    const sectionTop = (section as HTMLElement).offsetTop
    const distance = Math.abs(scrollY - sectionTop)

    if (distance < proximityDistance) {
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      })
    }
  })
}

let scrollTimeout: number

const handleScroll = () => {
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(snapToNearest, 150)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  clearTimeout(scrollTimeout)
})
</script>

<style scoped lang="scss">
@use "../src/style/variables.scss" as *;

.app-container>* {
  @extend .center;
}
</style>