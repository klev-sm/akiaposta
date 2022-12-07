const { DataTypes } = require("sequelize")
const connection = require("../../database/connection")

const UserMatch = connection.define("UserMatch", {
    team1Goals : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team2Goals: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
})

module.exports = UserMatch