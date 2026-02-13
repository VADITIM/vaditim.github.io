<template>
	<div class="mobile-notice">
		<div class="test">Mobile Devices currently unsupported.</div>
		<div class="test2">Check out the Desktop version!</div>
	</div>
</template>

<script setup lang="ts">
import { createFloatingAnimation } from '@modules/animations/General/floating-elements';
import { onMounted } from 'vue';


onMounted(() => {
		createFloatingAnimation(".test", { amplitude: 5})
		createFloatingAnimation(".test2", { amplitude: 15})
})



</script>

<style lang="scss" scoped>
	@use "@styleVariables" as *;
	
	.mobile-notice {
		display: flex;
		position: absolute;
		justify-content: center;
		align-items: center;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgb(22, 22, 22);
		color: white;
		text-align: center;
		z-index: -9999;
		opacity: 0;
		font-family: Wosker;

		@include allMobileDevices {
			display: flex;
			z-index: 9999;
			opacity: 1;
		}
	}

	.test {
		@include absoluteCenter(40%, 50%);
		font-size: 1.6rem;
		width: 80%;
		color: $red;
	}

	.test2 {
		@include absoluteCenter(85%, 50%);
		width: 95%;
		font-size: 1rem;
	}

</style>
