<template>
	<div class="loading-container" :class="{ open: open }" @click="toggleOpen">
		<div class="top-background" :class="{ open: open }"></div>
		<div class="bottom-background" :class="{ open: open }"></div>

		<div class="portfolio-text-top" :class="{ open: open }">PORTFOLIO</div>
		<div class="portfolio-text-bottom" :class="{ open: open }">PORTFOLIO</div>

		<div v-for="(text, index) in texts" :key="index" class="text"
			:style="{ top: text.top, left: text.left, '--text-delay': `${index * 0.15}s` }" :class="{ open: open }">
			{{ text.content }}
			<div class="hidder" :class="{ open: open }" :style="{ '--stagger': `${index * 0.15}s` }"></div>
		</div>

	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { transitioning } from '../modules/projects';
const open = ref<boolean>(false);

function toggleOpen() {
	open.value = !open.value;
}

onMounted(() => {
	toggleOpen();
})



interface TextItem {
	content: string;
	top: string;
	left: string;
}

const texts: TextItem[] = [
	{ content: "Creating digital experiences", top: "20%", left: "45%" },
	{ content: "Bringing ideas to life", top: "40%", left: "85%" },
	{ content: "Innovating through design", top: "55%", left: "10%" },
	{ content: "Crafting seamless interfaces", top: "80%", left: "25%" },
	{ content: "Transforming visions into reality", top: "15%", left: "15%" },
	{ content: "Transforming visions into reality", top: "10%", left: "85%" },
	{ content: "Innovating through design", top: "70%", left: "70%" },
	{ content: "Innovating through design", top: "90%", left: "50%" },
];


</script>

<style scoped lang="scss">
@use "../style/variables.scss" as *;

.loading-container {
	@extend .disable-selection;
	position: absolute;
	top: 0;
	min-width: 100%;
	min-height: 100%;
	background-color: #181818;
	overflow: hidden;
	z-index: 300;

	transition: .6s ease all 2s;

	&.open {
		top: -100%
	}
}

.portfolio-text-top,
.portfolio-text-bottom {
	@include absoluteCenter(50%, 50%);
	display: flex;
	align-self: center;
	justify-self: center;

	line-height: 5rem;
	padding-top: 2rem;

	height: fit-content;
	color: rgb(91, 253, 91);
	text-align: center;
	font-size: 10rem;
	font-family: Wosker;
	z-index: inherit;

	transition: .5s ease-in-out all .5s;
}

.portfolio-text-top {
	top: 50.1%;
	clip-path: polygon(0 50%, 100% 50%, 100% 0, 0 0);

	&.open {
		top: 45%
	}
}

.portfolio-text-bottom {
	top: 49.9%;
	clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0% 100%);

	&.open {
		top: 55%
	}
}

.top-background,
.bottom-background {
	position: absolute;
	width: 100%;
	height: 0%;
	height: 0%;
	background-color: #242424;
	background-color: rgb(91, 253, 91);
	z-index: 301;

	transition:
		1.5s ease-in-out all .5s;

	&.open {
		height: 50%;
	}
}

.top-background {
	bottom: 50%;
}

.bottom-background {
	top: 50%;
}

.text {
	position: absolute;
	transform: translate(-50%, -50%);
	color: white;
	font-size: 2rem;
	font-family: Wosker;
	text-wrap: nowrap;
	z-index: 300;
	opacity: 1;

	transition:
		color 0s ease var(--text-delay, 1s);

	&.open {
		color: transparent;



	}
}

.hidder {
	position: absolute;
	top: 0;
	left: 0%;
	width: 0%;
	height: 100%;
	background-color: rgb(91, 253, 91);
	z-index: 301;

	transition: left 1.2s ease var(--stagger, .3s), width .25s ease var(--stagger, 0s);

	&.open {
		width: 100%;
		left: 300%;
	}
}
</style>