<template>
	<div v-if="isVisible" class="hardware-acceleration-notice">
		<Module ref="panelRef" class="han-panel" accent="#DC143C">
			<template #label>NOTICE</template>
			<div class="han-content">
				<div class="han-header">Hardware Acceleration Required</div>
				<div class="han-extra">For the best experience, please enable hardware acceleration in your browser settings.</div>
				<div class="han-actions">
					<MagneticButton class="han-btn-wrap" :zone="24" :strength="0.35" @click="chooseMode('full')">
						DONE!
					</MagneticButton>
					<MagneticButton class="han-btn-wrap han-btn-wrap--muted" :zone="24" :strength="0.35" @click="chooseMode('lite')">
						CONTINUE WITH LITE ANIMATIONS.
					</MagneticButton>
				</div>
				<div class="han-hint">You can change this later in the settings.</div>
			</div>
		</Module>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, onMounted } from 'vue';
	import { ref } from 'vue';
	import { gsap } from 'gsap';
	import { hardwareNoticeActive as isVisible } from '@modules/miscHardwareNotice';
	import { hasChosenAnimationMode, setAnimationMode, type AnimationMode } from '@modules/miscAnimationMode';
	import Module from '@components/Misc/Module.vue';
	import MagneticButton from '@components/Misc/Magnetic-Button.vue';

	const panelRef = ref<InstanceType<typeof Module> | null>(null);

	// Reload rather than flip live: animation handlers read the mode as they
	// register, which has already happened for anything mounted behind the notice.
	const chooseMode = (mode: AnimationMode) => {
		setAnimationMode(mode);
		isVisible.value = true;
		window.location.reload();
	};

	onMounted(() => {
		isVisible.value = !hasChosenAnimationMode();
		if (!isVisible.value) return;

		nextTick(() => {
			const panel = panelRef.value?.element;
			if (!panel) return;
			gsap.fromTo(
				panel,
				{ opacity: 0, y: 36, scale: 0.96 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)', delay: 0.5 },
			);
		});
	});
</script>

<style lang="scss" scoped>
	@use "@styleVariables" as *;

	.hardware-acceleration-notice {
		@include flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100dvh;
		background-color: rgba(20, 20, 20, 0.97);
		color: white;
		z-index: 9999;
		font-family: Wosker;

		@include allMobile {
			z-index: -9999;
			opacity: 0;
		}
	}

	.han-panel {
		width: clamp(320px, 50vw, 700px);
		height: 40vh;
	}

	.han-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1rem;
		text-align: center;
	}

	.han-header {
		font-size: clamp(1.6rem, 3vw, 2.8rem);
		color: $red;
		line-height: 1.1;
	}

	.han-extra {
		font-size: clamp(0.85rem, 1.4vw, 1.2rem);
		color: #aaa;
		font-family: 'Mono';
		letter-spacing: 1px;
		line-height: 1.5;
	}

	.han-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.9rem;
	}

	.han-hint {
		font-family: 'Mono';
		font-size: 0.75rem;
		letter-spacing: 1px;
		color: #666;
	}

	.han-btn-wrap {
		:deep(.mag-btn) {
			font-family: Wosker;
			font-size: 1.6rem;
			padding: 0.6rem 2.5rem;
			background-color: $red;
			color: white;
			border-radius: 8px;
			border-bottom: solid 0.4rem #910d28;
		}
	}

	// The opt-out: same shape, no fill, so it reads as the secondary choice.
	.han-btn-wrap--muted {
		:deep(.mag-btn) {
			font-size: 1rem;
			padding: 0.55rem 1.6rem;
			background-color: transparent;
			color: #8a8a8a;
			border: 1px solid #3a3a3a;
			border-bottom: solid 0.25rem #2a2a2a;
			transition: color 0.2s, border-color 0.2s;
		}

		:deep(.mag-btn):hover {
			color: #d8d8d8;
			border-color: #5a5a5a;
		}
	}
</style>
