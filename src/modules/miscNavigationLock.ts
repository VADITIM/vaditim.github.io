import { ref, computed, watch } from 'vue';

const isNavigationLocked = ref(false);
const lockSources = new Set<string>();
let isInputSuppressed = false;
let previousHtmlOverflow = '';
let previousBodyOverflow = '';

const BLOCKED_KEYS = new Set([
	'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ',
]);

const suppressEvent = (event: Event) => {
	event.preventDefault();
};

const suppressKeyEvent = (event: KeyboardEvent) => {
	if (BLOCKED_KEYS.has(event.key)) {
		event.preventDefault();
	}
};

const suppressInputs = () => {
	if (isInputSuppressed) return;
	isInputSuppressed = true;

	previousHtmlOverflow = document.documentElement.style.overflow;
	previousBodyOverflow = document.body.style.overflow;
	document.documentElement.style.overflow = 'hidden';
	document.body.style.overflow = 'hidden';

	window.addEventListener('wheel', suppressEvent, { passive: false });
	window.addEventListener('touchmove', suppressEvent, { passive: false });
	window.addEventListener('keydown', suppressKeyEvent, { passive: false });
};

const releaseInputs = () => {
	if (!isInputSuppressed) return;
	isInputSuppressed = false;

	document.documentElement.style.overflow = previousHtmlOverflow;
	document.body.style.overflow = previousBodyOverflow;

	window.removeEventListener('wheel', suppressEvent);
	window.removeEventListener('touchmove', suppressEvent);
	window.removeEventListener('keydown', suppressKeyEvent);
};

export const setNavigationLock = (locked: boolean, source = 'default') => {
	if (locked) {
		lockSources.add(source);
	} else {
		lockSources.delete(source);
	}

	isNavigationLocked.value = lockSources.size > 0;
};

watch(isNavigationLocked, (locked) => {
  if (locked) {
    suppressInputs();
    return;
  }

  releaseInputs();
}, { immediate: true });

export const getIsNavigationLocked = computed(() => isNavigationLocked.value);

export const navigationLockRef = isNavigationLocked;
