const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	full_name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model('User', UserSchema)