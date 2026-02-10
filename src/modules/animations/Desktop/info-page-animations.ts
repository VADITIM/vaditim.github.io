import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { breakpoints } from "../animation-handler";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function DesktopAnimationInfoPage() {
  Contact();

  ShowFrontCards();
  ShowBackCards();
}

function Contact() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".contact-container")) {
        gsap.to(".contact-container",
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          top: "50%",
          left: "80%",

          scrollTrigger: { trigger: ".info-scroller-top", scrub: false, toggleActions: "play none none reverse",
            start: "top 35%", 
            end: "bottom 0%",
            // markers: true,
}})}});}


function ShowFrontCards() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".info-scroller-top",
          toggleActions: "play none none reverse",
          start: "top 40%",
          end: "bottom 5%",
        },
      });
    
      const startPos = {
        card1: { left: "-100%", bottom: "100%" },
        card2: { right: "-100%", bottom: "100%" },
        card3: { left: "-100%", bottom: "-100%" },
        card4: { right: "-100%", bottom: "-100%" },
      };

      const finalPos = {
        card1: { left: "18%", bottom: "39%" },
        card2: { right: "18%", bottom: "39%" },
        card3: { left: "18%", bottom: "5%" },
        card4: { right: "18%", bottom: "5%" },
      };

      gsap.set(".card1", startPos.card1);
      gsap.set(".card2", startPos.card2);
      gsap.set(".card3", startPos.card3);
      gsap.set(".card4", startPos.card4);

      timeline.to(".card1", { ...finalPos.card1, duration: .3, ease: "power2.out" }, 0.15);
      timeline.to(".card4", { ...finalPos.card4, duration: .3, ease: "power2.out" }, 0.10);
      timeline.to(".card3", { ...finalPos.card3, duration: .3, ease: "power2.out" }, 0.17);
      timeline.to(".card2", { ...finalPos.card2, duration: .3, ease: "power2.out" }, 0.12);
    },
  );
}

function Card1Show() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".card1")) {
      gsap.fromTo(".card1", 
        { left: "-100%", bottom: "100%" }, 
        {
          left: "18%",
          bottom: "39%",
          
          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
}})}

function Card2Show() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".card2")) {
			gsap.fromTo(".card2", 
        { right: "-100%", bottom: "100%" }, 
        {
          right: "18%",
          bottom: "39%",

          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
}})}

function Card3Show() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".card3")) {
      gsap.fromTo(".card3", 
        { left: "-100%", bottom: "-100%" }, 
        {
          left: "18%",
          bottom: "5%",
          
          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
}})}

function Card4Show() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {

      if (document.querySelector(".card4")) {
      gsap.fromTo(".card4", 
        { right: "-100%", bottom: "-100%" }, 
        {
          right: "18%",
          bottom: "5%",
          
          duration: 0.3,
          scrollTrigger: { trigger: ".info-scroller-top", toggleActions: "play none none reverse",
            start: "top 40%",
            end: "bottom 5%",
            // markers: true,
          },
        }
      );
}})}

function ShowBackCards() {
  gsap.matchMedia().add(`(min-width: ${breakpoints.desktop}px)`, () => {
    
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".info-scroller-top",
          toggleActions: "play none none reverse",
          start: "top 40%",
          end: "bottom 5%",
        },
      });
    
      const startPos = {
        card1: { left: "-100%", bottom: "100%" },
        card2: { right: "-100%", bottom: "100%" },
        card3: { left: "-100%", bottom: "50%" },
        card4: { right: "-100%", bottom: "50%" },
      };

      const finalPos = {
        card1: { left: "18%", bottom: "53.5%" },
        card2: { right: "18%", bottom: "53.5%" },
        card3: { left: "18%", bottom: "19.5%" },
        card4: { right: "18%", bottom: "19.5%" },
      };

      gsap.set(".back-card1", startPos.card1);
      gsap.set(".back-card2", startPos.card2);
      gsap.set(".back-card3", startPos.card3);
      gsap.set(".back-card4", startPos.card4);

      timeline.to(".back-card1", { ...finalPos.card1, duration: 0.4, ease: "power2.out" }, 0.30);
      timeline.to(".back-card4", { ...finalPos.card4, duration: 0.4, ease: "power2.out" }, 0.20);
      timeline.to(".back-card3", { ...finalPos.card3, duration: 0.4, ease: "power2.out" }, 0.25);
      timeline.to(".back-card2", { ...finalPos.card2, duration: 0.4, ease: "power2.out" }, 0.30);
    },
  );
}