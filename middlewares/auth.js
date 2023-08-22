const jwt = require("jsonwebtoken")
const User = require("../models/user")
require("dotenv").config()

exports.authenticate = async(req, res, next) => {
	try {
		const token = req.header("Authorization")
		//console.log(token);
		const user = jwt.verify(token, process.env.TOKEN_PRIVATE_KEY);
		const userInstance = await User.findByPk(user.email);

		req.user = userInstance;
		//console.log(userInstance)
		next();
	} catch (err) {
		console.log(err)
		return res.status(401).json({ succ: false, message: "unauthorized access" })
	}
}