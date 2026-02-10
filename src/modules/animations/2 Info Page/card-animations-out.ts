import { gsap } from "gsap/gsap-core";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ immediateRender: false });

export function CardAnimationsOut() {
    ScrollTrigger.matchMedia({
        // Desktop
        "(min-width: 842px)": function() {

            const outTrigger = {
                id: "back-cards-out",
                trigger: ".info-scroller-top",
                toggleActions: "play none none reverse",
                start: "top -70%",
                end: "bottom -40%",
                markers: true,
            };

            gsap.to(".card1", {
                left: "-200%",
                duration: 0.2,
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".card3", {
                left: "-200%",
                duration: 0.2,
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".card2", {
                right: "-200%",
                duration: 0.2,
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".card4", {
                right: "-200%",
                duration: 0.2,
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".back-card1", {
                opacity: 0,
                left: "-200%",
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".back-card2", {
                opacity: 0,
                right: "-200%",
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".back-card3", {
                opacity: 0,
                left: "-200%",
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });

            gsap.to(".back-card4", {
                opacity: 0,
                right: "-200%",
                overwrite: "auto",
                scrollTrigger: outTrigger,
            });
        },
    });
}
