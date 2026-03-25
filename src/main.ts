import { createApp } from 'vue'
import './style/style.scss'
import App from './App.vue'
import './style/variables.scss'

if (typeof window !== 'undefined') {
	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual'
	}
	window.scrollTo(0, 0)
}

createApp(App).mount('#app')
