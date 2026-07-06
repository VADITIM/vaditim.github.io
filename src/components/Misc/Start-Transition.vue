<template>
	<div>
		<div v-if="showLoadingPage" class="explore-mag-pos">
			<MagneticButton ref="exploreBtnRef" :zone="48" :strength="0.4" @click="OnExploreClick">
				EXPLORE&nbsp;▸
			</MagneticButton>
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
	import { onBeforeUnmount, onMounted, ref } from 'vue';
	import fullscreenIcon from '@assets/images/icons/fullscreen.png';
	import minimiseIcon from '@assets/images/icons/minimise.png';
	import MagneticButton from '@components/Misc/Magnetic-Button.vue';

	interface Props {
		showLoadingPage: boolean;
		containerElement: HTMLElement | null;
		isMobile: boolean;
	}

	const props = defineProps<Props>();
	const isFullscreen = ref(false);
	const exploreBtnRef = ref<InstanceType<typeof MagneticButton> | null>(null);

	// Expose the inner button element so Start-Section.vue can drive its
	// enter/exit GSAP tweens (the `.explore-button` selector is gone).
	defineExpose({
		get exploreEl() { return exploreBtnRef.value?.el ?? null }
	});

	async function OnExploreClick() {
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

	.explore-mag-pos {
		position: fixed;
		bottom: 15%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 310;

		@include allMobile {
			bottom: 16%;
		}

		:deep(.mag-btn) {
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
			white-space: nowrap;
			opacity: 0;

			@include allMobile {
				padding: 15px 36px;
				font-size: 16px;
			}
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
