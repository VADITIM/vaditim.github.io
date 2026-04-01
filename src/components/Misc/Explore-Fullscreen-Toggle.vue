<template>
	<div>
		<div v-if="showLoadingPage" ref="exploreButtonRef" class="explore-button" @click="OnExploreClick">Explore</div>

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

	.explore-button {
		position: fixed;
		bottom: 25%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 310;
		padding: 0.75rem 2.5rem;
		font-size: 1.6rem;
		font-family: Wosker;
		color: #181818;
		background-color: rgb(91, 253, 91);
		border-radius: 0.5rem;
		cursor: pointer;
		letter-spacing: 0.05rem;

		transition: 
      all 0.3s ease;

		@include allMobile {
			bottom: 30%;
			padding: 0.6rem 2rem;
			font-size: 0.95rem;
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
