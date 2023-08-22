const express = require("express")

const router = express.Router();

const groupController = require("../controllers/group")
const authMiddleWare = require("../middlewares/auth")


//urls has filtr /group
router.post("/creategroup", authMiddleWare.authenticate, groupController.postCreateGroup);
//gett all goups user has participated
router.get("/getall", authMiddleWare.authenticate, groupController.getAllGroups);
router.get("/getgroupmessage/:groupId", authMiddleWare.authenticate, groupController.getGroupMessages);
router.get("/getnew/groupmessage/:groupId", authMiddleWare.authenticate, groupController.getNewGroupMessages);
router.post("/join", authMiddleWare.authenticate, groupController.postJoinGroup);


module.exports = router;