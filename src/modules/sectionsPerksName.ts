import { ref, onMounted } from 'vue';
import { createFloatingAnimation } from '@modules/animationFloatingElements';
import { SECTION_INDEX } from '@modules/sectionsStateMachine';

export const firstNameRef = ref<HTMLElement>();
export const lastNameRef = ref<HTMLElement>();

export const tilts = [firstNameRef, lastNameRef];

export const firstName: string[] = ['v', 'a', 'd', 'i', 'm'];
export const lastName: string[] = ['n', 'i', 'e', 'd', 'e', 'n', 't', 'a', 'l']

export const InitializeFloatingElements = () => {
	onMounted(() => {
		if (window.innerWidth > 1050) 
		{
				createFloatingAnimation(".first-name", { amplitude: 15, section: SECTION_INDEX.PERKS })
				createFloatingAnimation(".last-name", { amplitude: 15, section: SECTION_INDEX.PERKS })
		} 
		else 
		{
				createFloatingAnimation(".first-name", { amplitude: 5, section: SECTION_INDEX.PERKS })
				createFloatingAnimation(".last-name", { amplitude: 5, section: SECTION_INDEX.PERKS })
		}
	})
}