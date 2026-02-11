import { gsap } from "gsap";
import { PerksAnimationDesktop } from "./Desktop/Perks-Animation-Handler";
import { ProfileAnimationDesktop } from "./Desktop/Profile-Animation-Handler";
import { ProjectAnimationDesktop } from "./Desktop/Projects-Animation-Handler";

gsap.defaults({ immediateRender: false });

export const breakpoints = {
    mobile: 435,
    tablet: 840,
    tabletLandscape: 1200,
    smallDesktop: 1500,
    desktop: 1800,
    largeDesktop: 2140,
} as const;

export function PageAnimations() 
{
    PerksAnimationDesktop();
    ProfileAnimationDesktop();
    ProjectAnimationDesktop();
}
  

