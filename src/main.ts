import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ToastPlugin from 'vue-toast-notification';
import HighchartsVue from 'highcharts-vue';
import moment from 'moment';
import { store } from './store';

import 'vue-toast-notification/dist/theme-bootstrap.css';

const app = createApp(App)

app.use(router);
app.use(ToastPlugin);
app.use(HighchartsVue);
app.use(moment);
app.use(store)

app.mount('#app')
