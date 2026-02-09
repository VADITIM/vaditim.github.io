import { onMounted } from 'vue';
import VanillaTilt from 'vanilla-tilt';

export const InitializeTilt = (tilts: any[]) => {
  onMounted(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    if (!isIOS) {
      const tiltOptions = {
        max: 50,
        speed: 900,
        perspective: 1000,
        scale: 1.05
      };

      tilts.forEach(tilt => {
        if (tilt.value) {
          VanillaTilt.init(tilt.value, tiltOptions);
        }
      });
    }
  });
}