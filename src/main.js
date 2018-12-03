// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Buefy from 'buefy'
import router from './router'
import VueLocalStorage from 'vue-ls'

import './buefy-custom.scss'

Vue.config.productionTip = false

Vue.use(Buefy, { defaultIconPack: 'mdi' })
Vue.use(VueLocalStorage, { namespace: 'csvlint_' })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router
})
