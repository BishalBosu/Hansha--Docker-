const bcrypt = require("bcrypt")
const User = require("../models/user")
const Message = require("../models/message")
const sequelize = require("../utils/database")
const jwt = require("jsonwebtoken")
const Group = require("../models/group")

//gen token function
function generateAcessToken(email, name, ispremium) {
	return jwt.sign(
		{ email: email, name: name, ispremium: ispremium },
		process.env.TOKEN_PRIVATE_KEY
	)
}

exports.postSignup = async (req, res, next) => {
	try {
		//transaction constant
		const t = await sequelize.transaction()

		const name = req.body.name
		const email = req.body.email
		const phone = req.body.phone
		const pass = req.body.pass

		bcrypt.hash(pass, 10, async (err, hash) => {
			if (err) console.log(err)

			try {
				const user = await User.create(
					{
						email: email,
						name: name,
						password: hash,
						phone: phone,
						ispremium: false,
					},
					{ transaction: t }
				)

				//lets create the FREE FOR ALL GROUP for first user
				let group = await Group.findByPk(1)
				if (!group) {
					// handle error - group with the id 1 does not exist
					group = await Group.create({
						group_name: "Free For All",
						group_description: "A group where all the users can communicate",
						creatorEmail:"admin@hansha.com"
					}, { transaction: t })
				}

				await user.addGroup(group, { transaction: t })

				//adding joined state
				const msg = "joined...."
				await user.createMessage(
					{
						messages: msg,
						name: user.name,
						groupId: 1,
					},
					{ transaction: t }
				)

				await t.commit()

				res.json(user)
			} catch (err) {
				console.log(err)
				await t.rollback()
				//indicating conflict by 409
				res
					.status(409)
					.json({ err: err, message: "User may already exist", success: false })
			}
		})
	} catch (err) {
		await t.rollback()
		//indicating conflict by 409
		//res.status(409).json({err: err, message: "User may already exist", success: false})
		console.log("ssoutside hash signup.js", err)
	}
}

//for login
exports.postLogin = async (req, res, next) => {
	const email = req.body.email
	const pass = req.body.pass

	try {
		const user = await User.findByPk(email)
		const hashed_pass = user.password
		const name = user.name
		const ispremium = user.ispremium

		bcrypt.compare(pass, hashed_pass, async (err, result) => {
			if (err) {
				console.log("login hash error: ", err)
				return res
					.status(500)
					.json({
						success: false,
						message: "something went wrong in internal server.",
					})
			}

			if (result) {
				const token = generateAcessToken(email, name, ispremium)
				obj = {
					email,
					token,
				}
				return res.json(obj)
			} else {
				return res
					.status(401)
					.json({ success: false, message: "password not matched" })
			}
		})
	} catch (err) {
		//console.log("login": ,err)
		return res.status(404).json({ success: false, message: "Email not found" })
	}
}
