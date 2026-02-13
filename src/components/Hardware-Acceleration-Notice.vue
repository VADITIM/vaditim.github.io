<template>
	<div v-if="isVisible" class="hardware-acceleration-notice">
		<div class="test">Hardware Acceleration Required</div>
		<div class="test2">For the best experience, please enable hardware acceleration in your browser settings.</div>
		<button class="confirm" @click="dismissNotice">OK</button>
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
		position: absolute;
		top: 0;
		left: 0;
		width: 100svw;
		height: 100svh;
		background-color: rgba(0, 0, 0, 0.97);
		color: white;
		text-align: center;
		z-index: 9999;
		font-family: Wosker;

		@include allMobileDevices {
			z-index: -9999;
			opacity: 0;
		}
	}

	.test {
		@include absoluteCenter(40%, 50%);
		font-size: 5rem;
		text-wrap: nowrap;
		color: $red;
		
		@include allMobileDevices {
			width: 80%;
			text-wrap: wrap;
			font-size: 1.6rem;
		}
	}

	.test2 {
		@include absoluteCenter(50%, 50%);
		font-size: 1.8rem;
		text-wrap: nowrap;

		@include allMobileDevices {
			width: 95%;
			text-wrap: wrap;
			font-size: .9rem;
		}
	}

	.confirm {
		@include absoluteCenter(60%, 50%);
		padding: 0.7rem 2rem;
		font-family: Wosker;
		font-size: 1.3rem;
		border: none;
		border-radius: 8px;
		background-color: $red;
		color: white;
		cursor: pointer;
	}

</style>
