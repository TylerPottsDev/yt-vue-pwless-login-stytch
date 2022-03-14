// SETUP
const express = require("express")
const stytch = require("stytch")
const mongoose = require("mongoose")
const app = express()
require("dotenv").config()

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch(err => {
		console.error("Error connecting to MongoDB: ", err)
	})

// Stytch setup
const client = new stytch.Client({
	project_id: process.env.STYTCH_PID,
	secret: process.env.STYTCH_SECRET,
	env: process.env.STYTCH_ENV === "test" 
		? stytch.envs.test 
		: stytch.envs.prod
})
// END OF SETUP

// MIDDLEWARE
app.use(express.json())
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})
// END OF MIDDLEWARE

// MODELS
const User = require("./models/User")
// END OF MODELS

// ROUTES
app.post("/loginorcreate", async (req, res) => {
	const { email, full_name, isNew } = req.body

	const user = await User.findOne({ email })

	if (isNew) {
		if (user) {
			console.log(user);

			res.status(400).json({
				success: false,
				message: "User already exists"
			})
			return
		}

		if (!email || !full_name) {
			res.status(400).json({
				success: false,
				message: "Email and full name required"
			})

			return
		}

		const newUser = new User({ email, full_name })

		try {
			await client.magicLinks.email.loginOrCreate({email})

			newUser
				.save()
				.then(() => {
					res.status(201).json({
						success: true,
						message: "User created, email sent"
					})
				})
				.catch(err => {
					res.status(400).json({
						success: false,
						message: "Error creating user",
						error: err
					})
				})
		} catch (err) {
			res.status(400).json({
				success: false,
				message: "Error creating user",
				error: err
			})
		}
	} else {
		if (!user) {
			res.status(400).json({
				success: false,
				message: "User does not exist"
			})
			return
		}

		try {
			await client.magicLinks.email.loginOrCreate({email})
	
			res.status(200).json({
				success: true,
				message: "Email sent"
			})
		} catch (err) {
			res.status(400).json({
				success: false,
				message: "An error occurred",
				error: err
			})
		}
	}
})

app.post('/auth', async (req, res) => {
	console.log("Authenticating...")
	const { token } = req.body

	try {
		const response = await client.magicLinks.authenticate(token, {
			session_duration_minutes: 5
		})

		res.status(200).json({
			success: true,
			message: "Authenticated",
			session_token: response.session_token
		})
	} catch (err) {
		console.log(err)

		res.status(400).json({
			success: false,
			message: "Error authenticating",
			error: err
		})
	}
	
})

app.post('/user', async (req, res) => {
	const { token } = req.body

	try {
		const response = await client.sessions.authenticate({session_token: token})

		const u = await client.users.get(response.session.user_id)

		const user = await User.findOne({ email: u.emails[0].email })

		if (!user) {
			res.status(400).json({
				success: false,
				message: "User does not exist"
			})
			return
		} else {
			res.status(200).json({
				success: true,
				message: "User found",
				user
			})
		}
	} catch(err) {
		console.log(err)
		
		res.status(400).json({
			success: false,
			message: "Error authenticating",
			error: err
		})
	}
})

app.get('/reset', (req, res) => {
	User.deleteMany({}, () => {
		console.log("Deleted all users");
	}).catch(err => {
		console.log("An error occurred: ", err);
	})
	client.users.delete("user-test-0e2fa20d-5757-4030-92d8-e855ed5f6e9c")
		.then(resp => {
			console.log(resp)
			res.send("User Deleted")
		})
		.catch(err => {
			res.send("An error occured")
			console.log(err)
		});
})
// END OF ROUTES

// INITIALIZE
const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
// END OF INITIALIZE