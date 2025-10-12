import { ref } from "vue";

const card1Open = ref<boolean>(false);
const cardOneContent = ref<boolean>(false)
const card2Open = ref<boolean>(false);
const cardTwoContent = ref<boolean>(false)
const card3Open = ref<boolean>(false);
const cardThreeContent = ref<boolean>(false)
const card4Open = ref<boolean>(false);
const cardFourContent = ref<boolean>(false)


const isAnyOtherCardOpen = (currentCard: string) => {
  switch(currentCard) {
    case 'card1':
      return card2Open.value || card3Open.value || card4Open.value;
    case 'card2':
      return card1Open.value || card3Open.value || card4Open.value;
    case 'card3':
      return card1Open.value || card2Open.value || card4Open.value;
    case 'card4':
      return card1Open.value || card2Open.value || card3Open.value;
    default:
      return false;
  }
}

const ToggleCardOne = () => {
  if (card1Open.value) {
    card1Open.value = false;
    cardOneContent.value = false;
  } 
  else if (!isAnyOtherCardOpen('card1')) {
    card1Open.value = true;
    cardOneContent.value = true;
  }
}

const ToggleCardTwo = () => {
  if (card2Open.value) {
    card2Open.value = false;
    cardTwoContent.value = false;
  } 
  else if (!isAnyOtherCardOpen('card2')) {
    card2Open.value = true;
    cardTwoContent.value = true;
  }
}

const ToggleCardThree = () => {
  if (card3Open.value) {
    card3Open.value = false;
    cardThreeContent.value = false;
  } 
  else if (!isAnyOtherCardOpen('card3')) {
    card3Open.value = true;
    cardThreeContent.value = true;
  }
}

const ToggleCardFour = () => {
  if (card4Open.value) {
    card4Open.value = false;
    cardFourContent.value = false;
  } 
  else if (!isAnyOtherCardOpen('card4')) {
    card4Open.value = true;
    cardFourContent.value = true;
  }
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