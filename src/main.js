import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueLocalStorge from 'vue-localstorage'

Vue.config.productionTip = false

Vue.use(VueLocalStorge, {
  name: 'ls',
  bind: true
})

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
