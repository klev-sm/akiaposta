const { DataTypes } = require("sequelize")
const connection = require("../../database/connection")

const User = connection.define("User", {
    username : {
        type: DataTypes.STRING,
        allowNull: false
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

User.sync({force: false})
module.exports = User