const Sequelize = require("sequelize")
const sequelize = require("../utils/database")


const User  = sequelize.define('user', {

    name: {
		type: Sequelize.STRING,
		allowNull: false,
	},

	email: {
		type: Sequelize.STRING,
		primaryKey: true,
		allowNull: false,
	},
    phone: {
		type: Sequelize.STRING,
		allowNull: false,
	},
    password: {
		type: Sequelize.STRING,
		allowNull: false,
	},
    ispremium:{
        type: Sequelize.BOOLEAN,
		allowNull: true,
    }



});

module.exports = User