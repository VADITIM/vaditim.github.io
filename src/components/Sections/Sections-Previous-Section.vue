<template>
  <div class="previous-section" @click="ClickPreviosSection"
  ></div>
</template>

<script setup lang="ts" >
  import { breakpoints, onSectionStatesChange } from '@modules/animations/animation-handler';
  import { onMounted, ref } from 'vue';
  import gsap from 'gsap';

  onMounted(() => {
    PreviousSectionButtonAnimation();
  });

    const clicked = ref(false);

    function ClickPreviosSection() {
      clicked.value = !clicked.value;
    }

    function PreviousSectionButtonAnimation() {
    gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".previous-section")) {
        let previousSectionButtonAnimation: gsap.core.Animation | null = null;

        onSectionStatesChange(({ 
          enterProfileFromPerks: EnterFromPerksSection,
          leaveProfileToPerks: LeaveToPerksSection,
          leaveProfileToProjects: LeaveToProjectsSection,
          enterProfileFromProjects: EnterFromProjectsSection,
          skipProfile: skipped,
        }) => {

          if (skipped) {
            if (previousSectionButtonAnimation) previousSectionButtonAnimation.kill();
            gsap.set(".previous-section", { opacity: 0 });
          }
          else if (EnterFromPerksSection) {
            if (previousSectionButtonAnimation) previousSectionButtonAnimation.kill();

            previousSectionButtonAnimation = gsap
              .timeline()
              .to(".previous-section", {
                scale: .5,
                duration: 0.15,
                ease: "power2.out"
              })
              .to(".previous-section", {
                scale: 1,
                top: "0svh",
                transform: "translate(-50%, 50%)",
                duration: 0.6,
                ease: "power2.out"
              });
          }
          else if (LeaveToPerksSection) {
            if (previousSectionButtonAnimation) previousSectionButtonAnimation.kill();

            previousSectionButtonAnimation = gsap
              .timeline()
              .to(".previous-section", {
                scale: .8,
                duration: 0.15,
                ease: "power2.out"
              })
              .to(".previous-section", {
                scale: 1.2,
                duration: 0.1,
                ease: "power2.out"
              })
              .to(".previous-section", {
                scale: 0,
                top: "100svh",
                transform: "translate(-50%, -150%)",
                duration: 0.6,
                ease: "power2.out"
              });
          }
          else if (LeaveToProjectsSection) {
            if (previousSectionButtonAnimation) previousSectionButtonAnimation.kill();

            // previousSectionButtonAnimation = gsap.to(".previous-section", {
            //   opacity: 1,
            //   top: "-100%",
            //   ease: "elastic.inOut(.3, 0.3)",
            //   duration: 0.7
            // });
          }
          else if (EnterFromProjectsSection) {
            if (previousSectionButtonAnimation) previousSectionButtonAnimation.kill();

            previousSectionButtonAnimation = gsap
              .timeline()
              .to(".previous-section", {
                scale: .5,
                duration: 0.15,
                ease: "power2.out"
              })
              .to(".previous-section", {
                scale: 1.3,
                duration: 0.1,
                ease: "power2.out"
              })
              .to(".previous-section", {
                scale: 1,
                duration: 0.1,
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

  .previous-section {
    position: fixed;
    top: 100svh;
    left: 95%;
    transform: translate(-50%, -150%);
    width: 3rem;
    height: 3rem;
    background-color: transparent;
    z-index: 20;
    scale: 0;
		filter: drop-shadow(0px 0px 30px white);
    background-image: url("../../assets/images/icons/arrow-up.png");
    background-size: contain;


    &.to-profile-section {
      background-color: blue;
    }
  }

</style>