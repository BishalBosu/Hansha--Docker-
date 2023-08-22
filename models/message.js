const Sequelize = require("sequelize")
const sequelize = require("../utils/database")


const Message  = sequelize.define('message', {

    id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
        autoIncrement: true,
		allowNull: false,
	},
    messages: {
		type: Sequelize.STRING,
		allowNull: false,
	}, 
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	}, 

});

module.exports = Message