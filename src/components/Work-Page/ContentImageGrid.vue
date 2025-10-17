<template>
	<div class="description-grid" :class="{clicked: clicked}">
		<div class="div3" :class="{clicked: clicked}"></div>
		<div class="div1" :class="{clicked: clicked}"></div>
		<div class="div2" :class="{clicked: clicked}"></div>
		<div class="div4" :class="{clicked: clicked}"></div>
	</div>
</template>

<script lang="ts" setup>
import { clicked } from '../../modules/techContainer';
</script>

<style lang="scss" scoped>
@use "../../style/Work-Page/contentimagegrid.scss" as *;
</style>