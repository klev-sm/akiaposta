const { DataTypes } = require("sequelize")
const connection = require("../../database/connection")

const Result = connection.define("Result", {
    team1Goals : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team2Goals: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
})

module.exports = Result