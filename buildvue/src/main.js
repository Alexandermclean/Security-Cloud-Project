// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import axios from './api/axios'

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.use(Vuex)
if (module.hot) {  
 module.hot.accept();
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
