import { ref, onMounted } from 'vue';
import { createFloatingAnimation } from '../modules/floating-elements';
import VanillaTilt from 'vanilla-tilt';

export const firstNameRef = ref<HTMLElement>();
export const lastNameRef = ref<HTMLElement>();

export const firstName: string[] = ['v', 'a', 'd', 'i', 'm'];
export const lastName: string[] = ['n', 'i', 'e', 'd', 'e', 'n', 't', 'a', 'l']

export const InitializeFloatingElements = () => {
   onMounted(() => {
      if (window.innerWidth > 1050) 
      {
         createFloatingAnimation(".first-name", { amplitude: 15})
         createFloatingAnimation(".last-name", { amplitude: 15})
      } 
      else 
      {
         createFloatingAnimation(".first-name", { amplitude: 5})
         createFloatingAnimation(".last-name", { amplitude: 5})
      }
   })
}

export const InitializeTilt = () => {
   onMounted(() => {
      // Check if it's an iOS device
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      
      // Only initialize tilt on non-iOS devices
      if (!isIOS) {
         if (firstNameRef.value) 
         {
            VanillaTilt.init(firstNameRef.value, {
               max: 50,
               speed: 900,
               perspective: 1000,
               scale: 1.05
            })
         }
         if (lastNameRef.value) 
         {
            VanillaTilt.init(lastNameRef.value, {
               max: 50,
               speed: 900,
               perspective: 1000,
               scale: 1.05
            })
         }
      } else {
         console.log('Tilt disabled on iOS device')
      }
   })
}