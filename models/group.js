const Sequelize = require("sequelize")
const sequelize = require("../utils/database")


const Group  = sequelize.define('group', {

    id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
        autoIncrement: true,
		allowNull: false,
	},
    group_name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	group_description:{
		type: Sequelize.STRING,
		allowNull: false,
	},
	creatorEmail:{
		type: Sequelize.STRING,
		allowNull: false,
	},
	join_uuid:{
		type: Sequelize.STRING,
		allowNull: true,
	}
    

});

module.exports = Group