const express = require("express")
const router = express.Router()

const Bet = require("../Bet/Bet")

// get all bets
router.get("/bet", (req, res) => {

    try {
        Bet.findAll().then((bets) => {
            if(bets.length == 0) {
                res.status(200).json({
                    "msg" : "There is no bet saved yet."
                })
            } else {
                res.status(200).json({
                    "msg" : "Bets was successfully returned.",
                    "bets" : bets
                })
            }
        }).catch((err) => {
            res.status(400).json({
                "msg" : "Failed to get bets.",
                "error" : err 
            })
        })
    } catch (error) {
        res.status(400).json({
            "msg" : "Failed to get bets.",
            "error" : error
        })
    }

})

// get bet by id
router.get("/bet/:id", (req, res) => {

    try {
        const betId = req.params.id
        Bet.findByPk(betId).then((bet) => {
            if(bet == undefined) {
                res.status(200).json({
                    "msg" : "Does not exist at least one bet yet.",
                })
            } else {
                res.status(200).json({
                    "msg" : "Bet was successfully returned.",
                    "bet" : bet
                })
            }
        }).catch((error) => {
            res.status(400).json({
                "msg" : "Failed to get bet.",
                "error" : error
            })
        })
    } catch (error) {
        res.status(400).json({
            "msg" : "Failed to get bet.",
            "error" : error
        })
    }

})

// before creating a match, I need to have a bet, and this router make that for me
router.post("/bet", (req, res) => {
    try {
        const betName = req.body.betName

        Bet.create({
            betName: betName
        }).then(() => {
            res.status(200).json({
                "msg" : "Bet was successfully created.",
            })
        }).catch((error) => {
            res.status(400).json({
                "msg" : "Bet failed to post.",
                "error" : error
            })
        })
    } catch (error) {
        res.status(400).json({
            "msg" : "Bet failed to post.",
            "error" : error
        })
    }
})

module.exports = router