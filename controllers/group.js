const Group = require("../models/group")
const Sequelize = require("sequelize")
const { v4: uuidv4 } = require("uuid")

exports.postCreateGroup = async (req, res, next) => {
	const user = req.user
	const gName = req.body.gName
	const gDesc = req.body.gDesc

	//generating new uuid
	const uuid = uuidv4()

	try {
		const group = await user.createGroup(
			{
				group_name: gName,
				group_description: gDesc,
				creatorEmail: user.email,
				join_uuid: uuid,
			},
			{
				through: {
					isAdmin: true,
				},
			}
		)

		res.json(group)
	} catch (err) {
		res.status(500).json({ success: false, message: "internal error" })
	}
}

exports.getAllGroups = async (req, res, next) => {
	try {
		const groups = await req.user.getGroups()
		res.json(groups)
	} catch (err) {
		res
			.status(500)
			.json({ success: false, messgae: "Internal error fetching groups." })
	}
}

exports.getGroupMessages = async (req, res, next) => {
	try {
		const groupId = req.params.groupId
		const group = await Group.findByPk(groupId)

		//checking for unautorized access
		if (!group.hasUser(req.user)) {
			//unauth code
			return res
				.status(401)
				.json({ success: false, message: "Unathorized access attempt!" })
		}

		const messages = await group.getMessages()

		res.json(messages)
	} catch (err) {
		console.log("getting group message error!", err)
		res.status(500).json({ success: false, message: "Internal server error!" })
	}
}

exports.getNewGroupMessages = async (req, res, next) => {
	try {
		const lastId = req.query.lastId
		const groupId = req.params.groupId

		const group = await Group.findByPk(groupId)

		//console.log("lastId ", +lastId);
		const msgs = await group.getMessages({
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
		res.status(500).json({ success: false, message: "Internal server error." })
	}
}

exports.postJoinGroup = async (req, res, next) => {
	try {
		const group_uuid = req.body.uuidToJoin

		const groupToJoin = await Group.findOne({
			where: { join_uuid: group_uuid },
		})

		groupToJoin.addUser(req.user)

		res.json({
			success: true,
			message: `joined successfully!`,
			group: groupToJoin,
		})
	} catch (err) {
		res
			.status(500)
			.json({ success: false, message: "Internal error when joining" })
	}
}
