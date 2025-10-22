import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { activeProjectIndex, projectsContainer, } from "../projects";
import { ref } from "vue";

let _scrollRafId: number | null = null;
let _snapTimeoutId: number | null = null;
let _startTimeoutId: number | null = null;
const scrolled = ref<boolean>(false);
let con: HTMLElement | null = null;
let spa: HTMLElement | null = null;
gsap.registerPlugin(ScrollTrigger);


export function WorkPageAnimations() {

  con = document.querySelector('.projects-container') as HTMLElement;
  spa = document.querySelector('.spacer2') as HTMLElement;
  
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 842px)": function() {

      gsap.fromTo(".projects-header-container",
      { },
      { 
        left: "1%",
        ease: "elastic.inOut(.3, 0.3)",

        scrollTrigger: { trigger: ".work-scroller", scrub: true, toggleActions: "play none none reverse",
          start: "top 60%", 
          end: "bottom 0%",
          // markers: true,
      }})  


      const staggeredTimeline = gsap.timeline({ paused: true });
      staggeredTimeline.to(".project", {
        top: 0,
        ease: "elastic.out(1, 0.8)",
        stagger: { each: 0.4, from: "end" },
        duration: 2,
      });

      const instantTimelineDown = gsap.timeline({ paused: true });
      instantTimelineDown.to(".project", {
        top: "100%",
        duration: .5,
      });

      const instantTimelineUp = gsap.timeline({ paused: true });
      instantTimelineUp.to(".project", {
        top: "0%",
        duration: .5,
      });

      let animationState = "idle"; 

      ScrollTrigger.create({
        trigger: ".work-scroller",
        start: "top 20%",
        // markers: true,

        onEnter: () => {
          if (!scrolled.value) {
            if (spa) spa.classList.remove('transparent');
            if (con) con.classList.add('no-snap');

            instantTimelineDown.pause();
            animationState = "staggered";
            scrollToProjectTime(0)
            staggeredTimeline.progress(0).play();
          } else {
            animationState = "instant";
            instantTimelineUp.progress(0).play();
          }
        },
        onLeaveBack: () => {
          const con = document.getElementById('con') as HTMLElement;

          if (activeProjectIndex.value !== null)
          {
            activeProjectIndex.value = null;
            
            setTimeout(() => {
              staggeredTimeline.pause();
              instantTimelineUp.pause();
              animationState = "instant";
              
              instantTimelineDown.invalidate().progress(0).play();
            }, 800);
          } else {
          
          if (con) con.classList.remove('no-snap');
          
          staggeredTimeline.pause();
          instantTimelineUp.pause();
          animationState = "instant";
          
          instantTimelineDown.invalidate().progress(0).play();

                    
          if (!scrolled.value && projectsContainer.value) {
            const container = projectsContainer.value;
            if (spa) spa.classList.add('transparent');
            
            setTimeout(() => {
              container.scrollLeft = container.scrollWidth;
            }, 500);
          }
          }

          if (_scrollRafId !== null) {
            cancelAnimationFrame(_scrollRafId);
            _scrollRafId = null;
          }
          if (_snapTimeoutId !== null) {
            clearTimeout(_snapTimeoutId);
            _snapTimeoutId = null;
          }
          if (_startTimeoutId !== null) {
            clearTimeout(_startTimeoutId);
            _startTimeoutId = null;
          }

        }
      });
    },
  });
}


function scrollToProjectTime(index: number, duration = 3.5) {

  let scrollDelay: number = 300;
  let scrollTimer: number = 3800;

  if (!scrolled.value) {
    if (_snapTimeoutId !== null) {
      clearTimeout(_snapTimeoutId);
    }
    
    _snapTimeoutId = window.setTimeout(() => {
      if (con) con.classList.remove('no-snap');
      scrolled.value = true;
      _snapTimeoutId = null;
    }, scrollTimer);
  }

  if (_startTimeoutId !== null) {
    clearTimeout(_startTimeoutId);
  }
  
  _startTimeoutId = window.setTimeout(() => {
    if (!projectsContainer.value) return;

    const container = projectsContainer.value;
    const projectWidth = container.clientWidth * 0.22;
    const gap = container.clientWidth * 0.15;
    const projectSpacing = projectWidth + gap;
    const targetScroll = index * projectSpacing;

    if (_scrollRafId !== null) {
      cancelAnimationFrame(_scrollRafId);
      _scrollRafId = null;
    }

    if (duration <= 0) {
      container.scrollLeft = targetScroll;
      return;
    }

    const startScroll = container.scrollLeft;
    const distance = targetScroll - startScroll;
    const startTime = performance.now();

    const split = 0.0; 
    const tailFactor = 1 - split; 

    function easeOutBack(x: number) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function step(now: number) {
      const elapsed = (now - startTime) / 1000; 
      let t = Math.min(1, elapsed / duration); 

      let progress: number;
      if (t <= split) {
        progress = t; 
      } else {
        const u = (t - split) / tailFactor; 
        progress = split + easeOutBack(u) * tailFactor;
      }

      container.scrollLeft = startScroll + distance * progress;

      if (t < 1) {
        _scrollRafId = requestAnimationFrame(step);
      } else {
        _scrollRafId = null;
        container.scrollLeft = targetScroll; 
      }
    }

    _scrollRafId = requestAnimationFrame(step);
    _startTimeoutId = null;
  }, scrollDelay);
}

