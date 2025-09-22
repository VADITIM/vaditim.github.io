
import { ref, onMounted } from 'vue';
import { createAdvancedFloating, createFloatingAnimation } from '../modules/floating-elements';
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

export const InitializeTilt =() => {
   onMounted(() => {
   if (firstNameRef.value) 
   {
      VanillaTilt.init(firstNameRef.value, {
         max: 50,
         speed: 900
      })
   }
   if (lastNameRef.value) 
   {
      VanillaTilt.init(lastNameRef.value, {
         max: 50,
         speed: 900
      })
   }
})
}
