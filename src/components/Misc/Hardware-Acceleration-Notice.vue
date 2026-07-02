<template>
	<div v-if="isVisible" class="hardware-acceleration-notice">
		<ModuleDisplay ref="panelRef" class="han-panel" accent="#DC143C">
			<template #label>NOTICE</template>
			<div class="han-content">
				<div class="han-header">Hardware Acceleration Required</div>
				<div class="han-extra">For the best experience, please enable hardware acceleration in your browser settings.</div>
				<MagneticButton class="han-btn-wrap" :zone="24" :strength="0.35" @click="dismissNotice">
					OK
				</MagneticButton>
			</div>
		</ModuleDisplay>
	</div>
</template>

<script setup lang="ts">
	import { nextTick, onMounted } from 'vue';
	import { ref } from 'vue';
	import { gsap } from 'gsap';
	import { hardwareNoticeActive as isVisible } from '@modules/miscHardwareNotice';
	import ModuleDisplay from '@components/Misc/Module-Display.vue';
	import MagneticButton from '@components/Misc/Magnetic-Button.vue';

	const NOTICE_STORAGE_KEY = 'hardware-acceleration-notice-dismissed';

	const panelRef = ref<InstanceType<typeof ModuleDisplay> | null>(null);

	const dismissNotice = () => {
		localStorage.setItem(NOTICE_STORAGE_KEY, '1');
		isVisible.value = true;
		window.location.reload();
	};

	onMounted(() => {
		isVisible.value = localStorage.getItem(NOTICE_STORAGE_KEY) !== '1';
		if (!isVisible.value) return;

		nextTick(() => {
			const panel = panelRef.value?.el;
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
</style>
