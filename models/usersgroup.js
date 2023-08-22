const Sequelize = require("sequelize")
const sequelize = require("../utils/database")

// UsersGroups model (join table)
const UsersGroups = sequelize.define('usersgroups', {
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

module.exports = UsersGroups