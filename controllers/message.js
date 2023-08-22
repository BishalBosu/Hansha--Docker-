const User = require("../models/user")
const Message = require("../models/message")
const Group = require("../models/group")
const sequelize = require("../utils/database")
const jwt = require("jsonwebtoken")
const { Sequelize } = require("sequelize")

const io = require("socket.io")(3000, {
	cors: { origin: ["http://localhost:3009"], },
})

//socket.io connection handling
io.on("connection", (socket) => {
	socket.on("sendMessage", async (data) => {
		
		const { message, name, groupid, token} = data
		//console.log("sendmessage..", typeof groupid);
		const authUser = await authenticate(token)
		if (authUser) {
			try {
				//console.log("up:", authUser)
				await authUser.createMessage({
					messages: message,
					name: name,
					groupId: groupid,
				})


				if (groupid === 1) {
					socket.broadcast.emit("receive-message", {
						success: true,
						message: "message posted successfully.",
					})
				} else {
					socket
						.to(groupid)
						.emit("receive-message", {
							success: true,
							message: "message posted successfully.",
						})
				}
			} catch (err) {
				if (groupid === 1) {
					socket.broadcast.emit("receive-message", {
						success: false,
						message: "Internal error",
					})
				} else {
					socket
						.to(groupid)
						.emit("receive-message", {
							success: false,
							message: "Internal error",
						})
				}
			}
		} else {
			if (groupid === "") {
				socket.broadcast.emit("receive-message", {
					success: false,
					message: "unauthorized access",
				})
			} else {
				socket
					.to(groupid)
					.emit("receive-message", {
						success: false,
						message: "unauthorized access",
					})
			}
		}
	})

	socket.on("join-room", (groupid) => {
		socket.join(groupid)
	})
})

//socket.io authentication
async function authenticate(token){
	try {
		//console.log(token);
		const user = jwt.verify(token, process.env.TOKEN_PRIVATE_KEY)
		const userInstance = await User.findByPk(user.email)

		//console.log("auth:", userInstance)
		return userInstance;
		
	} catch (err) {
		console.log(err)
		return false
	}
}

//handle message sent with perticular group
//not used by current code
exports.postSentMessage = async (req, res, next) => {
	const msg = req.body.message
	const name = req.body.name
	const groupId = req.body.groupid

	try {
		//console.log(req.user)
		await req.user.createMessage({
			messages: msg,
			name: name,
			groupId: groupId,
		})

		res.json({ sucess: true, message: "message posted successfully." })
	} catch (err) {
		console.log(err)
		res.json({ success: false })
	}
}

//for perticular group
exports.getAllMessage = async (req, res, next) => {
	try {
		const groupId = req.params.groupid
		const mainGroup = await Group.findByPk(groupId)
		const messages = await mainGroup.getMessages()
		res.json(messages)
	} catch (err) {
		console.log(err)
		res.status(500).json({ success: false, message: "Internal server error" })
	}
}

exports.getNewMessages = async (req, res, next) => {
	try {
		const lastId = req.query.lastId
		//console.log("lastId ", +lastId);
		const msgs = await Message.findAll({
			where: {
				id: {
					[Sequelize.Op.gt]: +lastId,
				},
			},
		})

		//sending only last 10 messages when there are more messages

		return res.json(msgs.slice(-10))
	} catch (err) {
		console.log(err)
		res.status(500).json({ success: fasle, message: "Internal server error." })
	}
}
