<script setup>
import { ref } from 'vue'
import vm from '../main'
const showLoginForm = ref(true)
const email = ref("")
const full_name = ref("")

const ToggleForm = () => {
	showLoginForm.value = !showLoginForm.value
}

const LoginOrCreate = async () => {
	const response = await fetch("http://localhost:5000/loginorcreate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			email: email.value,
			full_name: full_name.value,
			isNew: !showLoginForm.value
		})
	}).then(res => res.json())

	if (response.success) {
		vm.$toast.success(response.message)
	} else {
		vm.$toast.error(response.message)
	}
}

</script>

<template>
	<main class="login">
		<section class="container mx-auto pt-16 pb-4 px-4">
			<h1 class="text-4xl mb-8 text-center">Login with magic</h1>

			<form
				v-if="showLoginForm"
				@submit.prevent="LoginOrCreate"
				class="bg-gray-700 max-w-md mx-auto rounded p-4">
				<h2 class="text-2xl mb-4">Enter your details</h2>

				<label class="block mb-2">
					<div class="text-gray-500 mb-2">Email Address</div>
					<input 
						type="email"
						placeholder="jondoe@test.com"
						v-model="email"
						class="block w-full rounded bg-gray-800 py-2 px-4"/>
				</label>

				<div class="flex justify-between items-center">
					<p>
						Need an account? <span class="link" @click="ToggleForm">Register here!</span>
					</p>
					
					<input 
						type="submit" 
						value="Login" 
						class="inline-block bg-emerald-400 text-lg text-gray-800 font-bold uppercase rounded px-4 py-2" />
				</div>
			</form>

			<form
				v-else
				@submit.prevent="LoginOrCreate"
				class="bg-gray-700 max-w-md mx-auto rounded p-4">
				<h2 class="text-2xl mb-4">Enter your details</h2>

				<label class="block mb-2">
					<div class="text-gray-500 mb-2">Full name</div>
					<input 
						type="text"
						placeholder="Jon Doe"
						v-model="full_name"
						class="block w-full rounded bg-gray-800 py-2 px-4"/>
				</label>

				<label class="block mb-2">
					<div class="text-gray-500 mb-2">Email Address</div>
					<input 
						type="email"
						placeholder="jondoe@test.com"
						v-model="email"
						class="block w-full rounded bg-gray-800 py-2 px-4"/>
				</label>

				<div class="flex justify-between items-center">
					<p>
						Already have an account? <span class="link" @click="ToggleForm">Login here!</span>
					</p>
					<input 
						type="submit" 
						value="Register" 
						class="inline-block bg-emerald-400 text-lg text-gray-800 font-bold uppercase rounded px-4 py-2" />
				</div>
			</form>
		</section>
	</main>
</template>