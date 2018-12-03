import Vue from 'vue'
import Router from 'vue-router'
import App from '@/App'
import Home from '@/pages/OnlineValidator'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: App,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      }
    ]
  }
]

const router = new Router({
  routes,
  mode: 'history'
})

export default router
