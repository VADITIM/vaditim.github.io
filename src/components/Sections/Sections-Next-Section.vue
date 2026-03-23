<template>
  <div class="next-section" @click="clickNextSection"
  ></div>
</template>

<script setup lang="ts" >
  import { breakpoints, onSectionStatesChange } from '@modules/animations/animation-handler';
  import { onMounted, ref } from 'vue';
  import gsap from 'gsap';

  onMounted(() => {
    NextSectionButtonAnimation();
  });

    const clicked = ref(false);

    function clickNextSection() {
      clicked.value = !clicked.value;
    }

    function NextSectionButtonAnimation() {
    gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".next-section")) {
        let nextSectionButtonAnimation: gsap.core.Animation | null = null;
        
        onSectionStatesChange(({ 
          enterProfileFromPerks: EnterFromPerksSection,
          leaveProfileToPerks: LeaveToPerksSection,
          leaveProfileToProjects: LeaveToProjectsSection,
          enterProfileFromProjects: EnterFromProjectsSection,
          skipProfile: skipped,
        }) => {
          
          if (skipped) {
            if (nextSectionButtonAnimation) nextSectionButtonAnimation.kill();
            gsap.set(".next-section", { opacity: 0 });
          } 
          else if (EnterFromPerksSection) {
            if (nextSectionButtonAnimation) nextSectionButtonAnimation.kill();

            nextSectionButtonAnimation = gsap
              .timeline()
              .to(".next-section", {
                scale: .5,
                duration: 0.15,
                ease: "power2.out"
              })
              .to(".next-section", {
                scale: 1.3,
                duration: 0.1,
                ease: "power2.out"
              })
              .to(".next-section", {
                scale: 1,
                duration: 0.1,
                ease: "power2.out"
              });
          } 
          else if (LeaveToPerksSection) {
            if (nextSectionButtonAnimation) nextSectionButtonAnimation.kill();
            
            nextSectionButtonAnimation = gsap.to(".next-section", {
              top: "100svh",
              transform: "translate(-50%, -150%)",
              duration: 0.6,
              ease: "power2.out"
            });
            
          }
          else if (LeaveToProjectsSection) {
            if (nextSectionButtonAnimation) nextSectionButtonAnimation.kill();

            nextSectionButtonAnimation = gsap
              .timeline()
              .to(".next-section", {
                scale: .8,
                duration: 0.15,
                ease: "power2.out"
              })
              .to(".next-section", {
                scale: 1.2,
                duration: 0.1,
                ease: "power2.out"
              })
              .to(".next-section", {
                scale: 0,
                top: "0svh",
                transform: "translate(-50%, 50%)",
                duration: 0.6,
                ease: "power2.out"
              });
          }
          else if (EnterFromProjectsSection) {
            if (nextSectionButtonAnimation) nextSectionButtonAnimation.kill();

            nextSectionButtonAnimation = gsap
              .timeline()
              .to(".next-section", {
                scale: .5,
                duration: 0.15,
                ease: "power2.out"
              })
              .to(".next-section", {
                scale: 1,
                top: "100svh",
                transform: "translate(-50%, -150%)",
                duration: 0.6,
                ease: "power2.out"
              });
          }
        });
      }
    });
  }


</script>

<style lang="scss">
  @use "@styleVariables" as *;

  .next-section {
    position: fixed;
    top: 100svh;
    left: 95%;
    transform: translate(-50%, -150%);
    width: 3rem;
    height: 3rem;
    background-color: transparent;
    z-index: 20;
		filter: drop-shadow(0px 0px 30px white);
    background-image: url("../../assets/images/icons/arrow-down.png");
    background-size: contain;

    &.to-profile-section {
      background-color: blue;
    }
  }

</style>