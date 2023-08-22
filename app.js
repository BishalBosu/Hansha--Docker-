require("dotenv").config()

const express = require("express")
const morgan = require("morgan")
const path = require("path")
const fs = require("fs")
const compression = require("compression")
const cors = require("cors")
var CronJob = require('cron').CronJob;
const bodyParser = require("body-parser")
const sequelize = require("./utils/database")


//imported models
const User = require("./models/user")
const Message = require("./models/message")
const Group = require("./models/group")
const UsersGroups = require("./models/usersgroup")
const ArchivedChat = require("./models/archivedChat");


//imported routes
const signupRouters = require("./routes/signup");
const messageRouters = require("./routes/message")
const groupRouters = require("./routes/group")
const { Sequelize } = require("sequelize")

const app = express();

//making the public file availavail to client side.
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ extended: false }));

//for morgan
const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "access.log"),
	{flags: 'a'}
)
	

app.use(cors({
	origin: "*",
	methods: ["GET", "POST"]

}))


//cron jobs to lighten the chat load
var job = new CronJob(
	//“At 00:00.” every day
    '0 0 * * *',
    async function() {
        
		try {
			// Get the current date minus one day
			const oneDayAgo = new Date();
			oneDayAgo.setDate(oneDayAgo.getDate() - 1);
		
			// Find all messages older than one day
			const messagesToTransfer = await Message.findAll({
			  where: {
				createdAt: {
				  [Sequelize.Op.lt]: oneDayAgo,
				},
			  },
			});
		
			// Transfer messages to the ArchivedChat table
			await ArchivedChat.bulkCreate(messagesToTransfer.map((message) => message.toJSON()));
		
			// Delete the transferred messages from the Chat table
			await Message.destroy({
			  where: {
				id: messagesToTransfer.map((message) => message.id),
			  },
			});
		
			console.log("Message transfer completed.");
		  } catch (error) {
			console.error("Error transferring messages:", error);
		  }
    },
    null,
    true,
    'Asia/Kolkata'
);


//passing the middlewares
app.use(compression());
app.use(morgan("combined", {stream: accessLogStream}))


app.use(signupRouters);

app.use("/message", messageRouters);
app.use("/group", groupRouters);

app.use((req, res, next)=>{
    res.redirect("/html/login.html")
})

User.hasMany(Message);
Message.belongsTo(User);

// Define the many-to-many relationship with the join table
User.belongsToMany(Group, { through: UsersGroups });
Group.belongsToMany(User, { through: UsersGroups });

Message.belongsTo(Group);
Group.hasMany(Message);



//sync with sequelize enries
sequelize
	.sync()
	.then((result) => {
        //either run on PORT variable if not availavail 3006
		app.listen(process.env.PORT || 3009)
	})
	.catch((err) => console.log("DbErroRRR: ", err))


