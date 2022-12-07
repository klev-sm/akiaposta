const { DataTypes } = require("sequelize")
const connection = require("../../database/connection")

const Bet = connection.define("Bet", {
    betName : {
        type: DataTypes.STRING,
        allowNull: false
    },
})

module.exports = Bet