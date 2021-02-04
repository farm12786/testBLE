import Vue from 'vue'
import VueRouter from 'vue-router'
import medbox from '../views/medbox.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'medbox',
    component: medbox
  }
]

const router = new VueRouter({
  routes
})

export default router
