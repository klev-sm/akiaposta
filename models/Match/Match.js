const { DataTypes } = require("sequelize")
const connection = require("../../database/connection")

const Match = connection.define("Match", {
    team1Name : {
        type: DataTypes.STRING,
        allowNull: false
    },
    team2Name : {
        type: DataTypes.STRING,
        allowNull: false
    },
    team1Goals : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team2Goals: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team1Logo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    team2Logo: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = Match 