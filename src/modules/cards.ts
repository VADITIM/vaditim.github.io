import { ref } from "vue";

const card1Open = ref<boolean>(false);
const cardOneContent = ref<boolean>(false)
const card2Open = ref<boolean>(false);
const cardTwoContent = ref<boolean>(false)
const card3Open = ref<boolean>(false);
const cardThreeContent = ref<boolean>(false)
const card4Open = ref<boolean>(false);
const cardFourContent = ref<boolean>(false)


 const ToggleCardOne = () => {
   card1Open.value = !card1Open.value;
   cardOneContent.value = !cardOneContent.value;
}

const ToggleCardTwo = () => {
   card2Open.value = !card2Open.value;
   cardTwoContent.value = !cardTwoContent.value;
}

const ToggleCardThree = () => {
   card3Open.value = !card3Open.value;
   cardThreeContent.value = !cardThreeContent.value;
}

const ToggleCardFour = () => {
   card4Open.value = !card4Open.value;
   cardFourContent.value = !cardFourContent.value;
}

export const cards = [
  {
    label: 'TECHNICAL',
    toggle: ToggleCardOne,
    open: card1Open,
    class: 'card1',
    openClass: 'card1-open',
    backClass: 'back-card1',
    content: "C#\n.NET\nSCSS\nTypeScript\nVue.js\nGit",
  },
  {
    label: 'PROFESSIONAL',
    toggle: ToggleCardTwo,
    open: card2Open,
    class: 'card2',
    openClass: 'card2-open',
    backClass: 'back-card2',
    content: "Test",
  },
  {
    label: 'ACHIEVEMENTS',
    toggle: ToggleCardThree,
    open: card3Open,
    class: 'card3',
    openClass: 'card3-open',
    backClass: 'back-card3',
    content: "Test",
  },
  {
    label: 'MINDSET',
    toggle: ToggleCardFour,
    open: card4Open,
    class: 'card4',
    openClass: 'card4-open',
    backClass: 'back-card4',
    content: "Test",
  },
];