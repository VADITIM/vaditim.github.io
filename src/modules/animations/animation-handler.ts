import { gsap } from "gsap/gsap-core";
import { WorkPageAnimations } from "./3 Work Page/work-page-animations";

gsap.defaults({ immediateRender: false });

export const breakpoints = {
    mobile: 435,
    tablet: 840,
    tabletLandscape: 1200,
    smallDesktop: 1500,
    desktop: 1800,
    largeDesktop: 2140,
} as const;

export function PageAnimations() {

    WorkPageAnimations();
}
  

