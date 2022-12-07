const express = require("express")
const app = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

// setting environment variables
require("dotenv").config()
const port = process.env.PORT

// setting and authenticating database
const database = require("./database/connection")
database.authenticate().then(() => {
    console.log("Database connection has been successfully established.")
}).catch((error) => {
    console.log(error)
})

// Creating the files that configures the tables from database.
// importing database's models
const Match = require("./models/Match/Match")
const UserMatch = require("./models/UserMatch/UserMatch")
const User = require("./models/User/User")
const Bet = require("./models/Bet/Bet")
const Result = require("./models/Result/Result")

// making associations
UserMatch.belongsTo(User)
Match.hasMany(UserMatch)
Bet.hasMany(Result)
Match.hasMany(Result)
Match.belongsTo(Bet)

// Creating the tables on database.
/* async function because the sync (the method that creates the table 
   from Sequelize) is asyncronous
*/
async function createTables() {
    await User.sync()
    await Bet.sync()
    await Match.sync()
    await Result.sync()
    await UserMatch.sync()
}
createTables()

// importing the routers that controls the routes
const UserRouter = require("./models/User/UserRouter")
const MatchRouter = require("./models/Match/MatchRouter")
const BetRouter = require("./models/Bet/BetRouter")

// importing models routes
app.use("/", UserRouter)
app.use("/", MatchRouter)
app.use("/", BetRouter)

app.listen(port, () => {
    console.log(`Server on and listening to ${port} port.`)
})