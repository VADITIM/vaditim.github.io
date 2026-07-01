<template>
	<div>
		<div v-if="showLoadingPage" ref="exploreWrapRef" class="explore-mag-wrap" @mousemove="onWrapMove" @mouseleave="onWrapLeave">
			<div ref="exploreButtonRef" class="explore-button" @click="OnExploreClick">EXPLORE&nbsp;▸</div>
		</div>

		<div v-if="!showLoadingPage && isMobile" class="fullscreen-toggle" @click="ToggleFullscreen" title="Toggle fullscreen">
			<div class="fullscreen-icon">
				<img v-if="isFullscreen" :src="minimiseIcon" alt="Exit fullscreen" class="icon-image" />
				<img v-else :src="fullscreenIcon" alt="Enter fullscreen" class="icon-image" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { gsap } from 'gsap';
	import { onBeforeUnmount, onMounted, ref } from 'vue';
	import fullscreenIcon from '@assets/images/icons/fullscreen.png';
	import minimiseIcon from '@assets/images/icons/minimise.png';

	interface Props {
		showLoadingPage: boolean;
		containerElement: HTMLElement | null;
		isMobile: boolean;
	}

	const props = defineProps<Props>();
	const isFullscreen = ref(false);
	const exploreButtonRef = ref<HTMLElement | null>(null);
	const exploreWrapRef = ref<HTMLElement | null>(null);

	// Magnetic follow for the EXPLORE button (design "01 · Loading Reveal").
	const onWrapMove = (e: MouseEvent) => {
		const wrap = exploreWrapRef.value, btn = exploreButtonRef.value;
		if (!wrap || !btn) return;
		const r = wrap.getBoundingClientRect();
		const dx = e.clientX - (r.left + r.width / 2);
		const dy = e.clientY - (r.top + r.height / 2);
		gsap.to(btn, { x: dx * 0.4, y: dy * 0.4, duration: 0.4, ease: 'power3.out' });
	};
	const onWrapLeave = () => {
		if (exploreButtonRef.value) gsap.to(exploreButtonRef.value, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' });
	};

	async function OnExploreClick() {
		// Play bouncy scale-away animation
		if (exploreButtonRef.value) {
			gsap.to(exploreButtonRef.value, {
				scale: 0,
				opacity: 0,
				duration: 0.6,
				ease: 'back.in',
				overwrite: 'auto',
			});
		}

		if (props.isMobile && props.containerElement) {
			try {
				if (props.containerElement.requestFullscreen) {
					await props.containerElement.requestFullscreen();
					isFullscreen.value = true;
				}
			} catch (error) {
				console.warn('Fullscreen request failed:', error);
			}
		}

		const loadingPageElement = document.querySelector('[data-loading-page]');
		if (loadingPageElement) {
			loadingPageElement.dispatchEvent(new CustomEvent('play-animation'));
		}
	}

	async function ToggleFullscreen() {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
				isFullscreen.value = false;
			} else if (props.containerElement && props.containerElement.requestFullscreen) {
				await props.containerElement.requestFullscreen();
				isFullscreen.value = true;
			}
		} catch (error) {
			console.warn('Fullscreen toggle failed:', error);
		}
	}

	onMounted(() => {
		const handleFullscreenChange = () => {
			isFullscreen.value = !!document.fullscreenElement;
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);

		onBeforeUnmount(() => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		});
	});
</script>

<style scoped lang="scss">
	@use "@styleVariables" as *;

	.explore-mag-wrap {
		position: fixed;
		bottom: 9%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 310;
		padding: 32px 48px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;

		@include allMobile {
			bottom: 16%;
			padding: 24px 36px;
		}
	}

	.explore-button {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 20px 50px;
		font-size: 20px;
		letter-spacing: 2px;
		font-family: 'Audiowide';
		color: #0e0e0e;
		background-color: #5bfd5b;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
		will-change: transform;

		@include allMobile {
			padding: 15px 36px;
			font-size: 16px;
		}
	}

	.fullscreen-toggle {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 310;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0.5rem;
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.fullscreen-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: #181818;
	}

	.icon-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		transition: transform 0.3s ease;
	}
</style>
