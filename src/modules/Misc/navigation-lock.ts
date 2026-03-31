import { ref, computed } from 'vue';

const isNavigationLocked = ref(false);

export const setNavigationLock = (locked: boolean) => {
	isNavigationLocked.value = locked;
};

export const getIsNavigationLocked = computed(() => isNavigationLocked.value);

export const navigationLockRef = isNavigationLocked;
