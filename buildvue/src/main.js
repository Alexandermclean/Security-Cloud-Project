// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import axios from './api/axios'
import vuexStore from './store/index'
import iView from 'iview'
import echart from 'echarts'
import $ from 'jquery'
import 'iview/dist/styles/iview.css'

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$echarts = echart
Vue.use(Vuex)
Vue.use(iView)

if (module.hot) {  
 module.hot.accept();
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  $: $,
  store: vuexStore
})
