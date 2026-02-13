<template>
	<div class="mobile-notice">
		<div class="test">This Website is currently only available on desktop devices.</div>
		<div class="test2">The Mobile version is Work in Progress.</div>
	</div>
</template>

<script setup lang="ts">



</script>

<style lang="scss" scoped>
	@use "@styleVariables" as *;
	
	.mobile-notice {
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgb(22, 22, 22);
		color: white;
		padding: 2rem;
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
		font-size: 3rem;
		width: 50%;
		color: $red;
	}

	.test2 {
		@include absoluteCenter(50%, 50%);
		font-size: 1.8rem;
		text-wrap: nowrap;
	}

</style>
