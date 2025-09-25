import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function CardsAnimations() {
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 436px)": function() {
      gsap.fromTo(".card1", 
        { 
          left: "-100%", 
          bottom: "100%" 
        }, 
        {
          left: "18%",
          bottom: "39%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );
			gsap.fromTo(".card2", 
        { 
          right: "-100%", 
          bottom: "100%" 
        }, 
        {
          right: "18%",
          bottom: "39%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );
				gsap.fromTo(".card3", 
        { 
          left: "-100%", 
          bottom: "-100%" 
        }, 
        {
          left: "18%",
          bottom: "5%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );
			gsap.fromTo(".card4", 
        { 
          right: "-100%", 
          bottom: "-100%" 
        }, 
        {
          right: "18%",
          bottom: "5%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse"
          },
        }
      );



      gsap.fromTo(".back-card1", 
        { 
          left: "-100%", 
          bottom: "100%" 
        }, 
        {
          left: "18%",
          bottom: "53.5%",
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    
    // Mobile
    "(max-width: 435px)": function() {
      gsap.fromTo(".card1", 
        { 
          left: "-100%", 
          top: "100%" 
        }, 
        {
          left: "0%",
          top: "0%",

          scrollTrigger: {
            trigger: ".scroller",
            start: "top 80%",
            end: "bottom 20%",
          },
        }
      );
    }
  });
}



export function BackCardsAnimations() {
const backCard1 = document.querySelector('.back-card1');
const backCard2 = document.querySelector('.back-card2');
const backCard3 = document.querySelector('.back-card3');
const backCard4 = document.querySelector('.back-card4');

  ScrollTrigger.matchMedia({
    "(min-width: 436px)": function() {
      gsap.fromTo(".back-card1", 
        { 
          left: "-100%", 
          bottom: "100%" 
        }, 
        {
          left: "18%",
          bottom: "53.5%",
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
            toggleActions: "play none none reverse",
            onEnter: () =>  { backCard1?.classList.remove('back-card-done'); },
            onLeaveBack: () => { backCard1?.classList.add('back-card-done'); }
          },
        }
      )
			gsap.fromTo(".back-card2", 
        { 
          right: "-100%", 
          bottom: "100%" 
        }, 
        {
          right: "18%",
          bottom: "53.5%",
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse",
            onEnter: () =>  { backCard2?.classList.remove('back-card-done'); },
            onLeaveBack: () => { backCard2?.classList.add('back-card-done'); }
          },
        }
      );
				gsap.fromTo(".back-card3", 
        { 
          left: "-100%", 
          bottom: "50%" 
        }, 
        {
          left: "18%",
          bottom: "19.5%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse",
            onEnter: () =>  { backCard3?.classList.remove('back-card-done'); },
            onLeaveBack: () => { backCard3?.classList.add('back-card-done'); }
          },
        }
      );
			gsap.fromTo(".back-card4", 
        { 
          right: "-100%", 
          bottom: "50%" 
        }, 
        {
          right: "18%",
          bottom: "19.5%",

          stagger: 0.1,
          scrollTrigger: {
            trigger: ".scroller",
            start: "top 20%",
            end: "bottom 5%",
            // markers: true,
						toggleActions: "play none none reverse",
            onEnter: () =>  { backCard4?.classList.remove('back-card-done'); },
            onLeaveBack: () => { backCard4?.classList.add('back-card-done'); }
          },
        }
      );
    }
  })
}