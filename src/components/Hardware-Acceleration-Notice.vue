<template>
	<div v-if="isVisible" class="hardware-acceleration-notice">
		<div class="header">Hardware Acceleration Required</div>
		<div class="extra">For the best experience, please enable hardware acceleration in your browser settings.</div>
		<button class="button" @click="dismissNotice">OK</button>
	</div>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue';
	import { hardwareNoticeActive as isVisible } from '@modules/hardware-notice';

	const NOTICE_STORAGE_KEY = 'hardware-acceleration-notice-dismissed';

	const dismissNotice = () => {
		localStorage.setItem(NOTICE_STORAGE_KEY, '1');
		isVisible.value = true;
		window.location.reload();
	};

	onMounted(() => {
		isVisible.value = localStorage.getItem(NOTICE_STORAGE_KEY) !== '1';
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
		width: 100svw;
		height: 100svh;
		background-color: rgba(20, 20, 20, 0.97);
		color: white;
		text-align: center;
		z-index: 9999;
		font-family: Wosker;

		@include allMobileDevices {
			z-index: -9999;
			opacity: 0;
		}
	}

	.header {
		position: relative;
		top: -10%;
		font-size: 5rem;
		text-wrap: nowrap;
		color: $red;
		
		@include allMobileDevices {
			width: 80%;
			text-wrap: wrap;
			font-size: 1.6rem;
		}
	}

	.extra {
		@include absoluteCenter(50%, 50%);
		font-size: 1.8rem;
		text-wrap: nowrap;

		@include allMobileDevices {
			width: 95%;
			text-wrap: wrap;
			font-size: .9rem;
		}
	}

	.button {
		@include absoluteCenter(60%, 50%);
		font-family: Wosker;
		font-size: 2.5rem;
		border: none;
		width: 7rem;
		height: 4rem;
		border-bottom: solid .7rem #910d28;
		border-radius: 8px;
		background-color: $red;
		color: white;
		cursor: pointer;
	}

</style>
