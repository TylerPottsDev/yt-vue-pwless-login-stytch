import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import vm from '../main'

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('../views/Login.vue')
	},
	{
		path: '/authenticate',
		name: 'authenticate'
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

router.beforeEach(async (to, from, next) => {
	if (to.matched.some(record => record.name === 'authenticate')) {
		const token = to.query.token

		if (token) {
			const response = await fetch('http://localhost:5000/auth', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token: token })
			})
			.then(res => res.json())
			.catch(err => {
				console.log(err.response)
				vm.$toast.error('Something went wrong. Please try again.')
			})

			if (response.success) {
				localStorage.setItem('token', response.session_token)
				vm.$toast.success('Success. Logging in...')
				return next('/')
			}
		}
	}

	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (localStorage.getItem('token')) {
			const response = await fetch('http://localhost:5000/user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token: localStorage.getItem('token') })
			}).then(res => res.json())

			if (response.success) {
				return next()
			} else {
				localStorage.removeItem('token')
				vm.$toast.error('Something went wrong. Please try again.')
				return next('/login')
			}
		}

		next('/login')
	} else if (to.matched.some(record => record.name === 'login')) {
		if (localStorage.getItem('token')) {
			const response = await fetch('http://localhost:5000/user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token: localStorage.getItem('token') })
			}).then(res => res.json())

			if (response.success) {
				return next('/')
			} else {
				next()
			}
		} else {
			next()
		}
	} else {
		next()
	}
})

export default router;