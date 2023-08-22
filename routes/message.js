const express = require("express")

const router = express.Router();

const messageController = require("../controllers/message")
const authMiddleWare = require("../middlewares/auth")


//urls has filtr /message
router.post("/send", authMiddleWare.authenticate, messageController.postSentMessage);

router.get("/getall/:groupid", authMiddleWare.authenticate, messageController.getAllMessage);

router.get("/getnew", authMiddleWare.authenticate, messageController.getNewMessages)

module.exports = router;