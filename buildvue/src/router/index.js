import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import main from '@/pages/main'
import northRouter from '@/pages/north/router'
import southRouter from '@/pages/south/router'

Vue.use(Router)
const undefinedRouter = {
	path: '/undefinedrouter',
	name: 'undefinedRouter',
	component: () => import('@/pages/undefinedRouterPage')
}
const hello = {
  path: '/',
  name: 'HelloWorld',
  component: HelloWorld
}

const north = {
	path: '/north',
	name: 'north',
	children: northRouter,
  component: main

}

const south = {
	path: '/south',
	name: 'south',
	children: southRouter,
  component: main
}
const routerConfig = [
	hello,
	north,
	south,
	undefinedRouter
]
const router = new Router({
  routes: routerConfig
})

router.beforeEach((to, from, next) => {
	if (to.matched.length === 0) {
		next({name: 'undefinedRouter'})
	} else {
		next()
	}
})

export default router
