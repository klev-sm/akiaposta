/** TODO
 * Save team logo images only when the table was saved on database [x]
 * test the other routes [x]
 * create function to response messages
 * comment code
 * change the routes that use the old images match folder, like the delete router [x]
 * Delete images and matches from the database [x]
 * 
 * create a temp folder [x]
 * save the images to that temp folder [x]
 * after successfully save to the database: move image from temp to matches folder [x]
 * move the 2 images [x]
 * after fail to save in the database: delete image from temp *** TO MAKE THAT
*/

const express = require("express")
const router = express.Router()
const fs = require("fs")
/* importing the Sequelize connection from database in order to use
the transactions functionality */
const connection = require("../../database/connection")

// the packages to handle images upload
const path = require("path")
const multer = require("multer")

// importing the database Match model
const Match = require("./Match")

// document global variable to get the path of this file
const pathDir = require.main.path

// saving the files on destination and filename specified below
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // creating dynamic directories based on bet and match quantities
        const tempDir = `${pathDir}/public/temp`
        // creating a folder if not exists
        fs.mkdir(tempDir, { recursive: true }, (err) => {
            if (err) throw err
            cb(null, `public/temp/`)
        })
    },
    filename: function (req, file, cb) {
        // getting an unique name for the file
        const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9)
        // getting the extension name of the file
        const fileExtension = path.extname(file.originalname)
        // saving the file
        cb(null, `${uniqueSuffix}${fileExtension}`)
    }
})

const upload = multer({ storage: storage })
//this code is instanciating 
const uploadImages = upload.fields([{ name: "team1Logo", maxCount: 1 }, { name: "team2Logo", maxCount: 1 }])
// router to make a match 
router.post("/match", async function (req, res) {
    try {
        // testing if the image has been successfully uploaded.
        uploadImages(req, res, async function (err) {
            if (err) {
                return res.status(400).json({
                    err: err.message
                })
            } // everything went fine
            // creating database's transaction with the connection to the Sequelize.
            const t = await connection.transaction()
            // getting the bet id needed to create a match row
            const BetId = req.body.betId
            // if the betId does not exists, the method will close
            if (BetId === undefined) {
                res.status(400).send({
                    "msg": "There was an error trying to create the match.",
                    "error": "Incorrect or inexistent bet id."
                })
            } else {
                // getting the values of the match from requisition
                const { team1Name, team2Name, team1Goals, team2Goals } = req.body
                const team1Logo = req.files["team1Logo"][0].filename
                // THIS LINE IS HAVING ERRORS IF I CHANGE THE NAME OF THE FILE
                // THE IMAGES ARE SAVE IN TEMP
                const team2Logo = req.files["team2Logo"][0].filename
                // checking if the data passed from req.body is not null.
                if (team1Name === undefined || team2Name === undefined || team1Goals === undefined || team2Goals === undefined || team1Logo === undefined || team2Logo === undefined) {
                    res.status(400).json({
                        "msg": "There was an error trying to create the match.",
                        "error": "One or more fields of the body of your requisition are undefined."
                    })
                } else {
                    // saving the data taken on db
                    await Match.create({
                        team1Name: team1Name,
                        team2Name: team2Name,
                        team1Goals: team1Goals,
                        team2Goals: team2Goals,
                        team1Logo: team1Logo,
                        team2Logo: team2Logo,
                        BetId: BetId,
                    }, { transaction: t }).then(async (match) => {
                        const pathDir = require.main.path
                        const betId = req.body.betId
                        const arrayLogos = [team1Logo, team2Logo]
                        for (let i = 0; i < arrayLogos.length; i++) {
                            const oldDir = path.join(pathDir, "public", "temp", arrayLogos[i])
                            const newDir = path.join(pathDir, "public", "uploads", "bets", betId.toString(), "matches", match.dataValues.id.toString())
                            fs.mkdir(newDir, { recursive: true }, async (err) => {
                                if (err) {
                                    await t.rollback()
                                    throw err
                                } else {
                                    fs.rename(oldDir, `${newDir}/${arrayLogos[i]}`, async (err) => {
                                        if (err) {
                                            await t.rollback()
                                            throw err
                                        }
                                    })
                                }
                            })
                        }
                        // commit the changes to db
                        await t.commit()
                        // change this code to fs.rename part
                        res.status(200).json({
                            "msg": "Match was successfully created.",
                            team1Name,
                            team2Name,
                            team1Goals,
                            team2Goals,
                            team1Logo,
                            team2Logo,
                            BetId
                        })
                    }).catch(async (error) => {
                        res.status(400).json({
                            "msg": "There was an error trying to create a match.",
                            // this is a way to translate error messages to String
                            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
                        })
                        // if there was an error, the table will be removed/rolled back
                        await t.rollback()
                    })
                }
            }
        })
    } catch (error) {
        res.status(400).json({
            "msg": "There was an error trying to post a match.",
            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        })
        // if there was an error, the table will be removed/rolled back
        await t.rollback()
    }
})

// router to GET all matches with a specific bet
router.get("/match/:betId", async (req, res) => {

    try {
        const t = await connection.transaction()
        const betID = req.params.betId
        Match.findAll({
            where: {
                BetId: betID
            }
        }).then(async (matches) => {
            res.status(200).json({
                status: "Success to get all the matches.",
                matches: matches
            })
            await t.commit()
        }).catch(async () => {
            res.status(404).json({
                "message": "Error trying getting matches",
                "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
            })
            await t.rollback()
        })
    } catch (error) {
        res.status(404).json({
            "message": "Error trying to take matches by ID.",
            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
        })
    }

})

// route to GET one match with the given match id
router.get("/match/:betID/:matchID", async (req, res) => {

    try {
        const t = await connection.transaction()

        const betID = req.params.betID
        const matchID = req.params.matchID

        Match.findOne({
            where: {
                id: matchID,
                BetId: betID
            }
        }).then(async (match) => {
            if (match != undefined) {
                res.status(200).json({
                    status: "Success to get the match.",
                    match: match
                })
                await t.commit()
            } else {
                res.status(400).json({
                    "message": "Invalid match id."
                })
                await t.rollback()
            }
        }).catch(async (error) => {
            res.status(404).json({
                "message": "Error trying to get match.",
                "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            })
            await t.rollback()
        })
    } catch (error) {
        res.status(404).json({
            "message": "Error trying to get the match.",
            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        })
    }


})

/* ToDo
 * Functionality to edit every field
*/

router.patch("/match/:betID/:matchId", async (req, res) => {
    try {
        uploadImages(req, res, async function (err) {
            if (err) {
                return res.status(400).json({
                    err: err.message
                })
            }

            const t = await connection.transaction()
            const matchId = req.params.matchId
            const BetId = req.params.betID
            
            Match.findOne({
                where: {
                    id: matchId,
                    BetId: BetId
                }
            }).then((match) => {
                if(match != undefined) {
                    const { team1Name, team2Name, team1Goals, team2Goals } = req.body
                    const team1Logo = req.files["team1Logo"][0].filename
                    const team2Logo = req.files["team2Logo"][0].filename

                    const arrayLogos = []

                    match.update({
                        team1Name: team1Name ? team1Name : match.team1Name,
                        team2Name: team2Name ? team2Name : match.team2Name,
                        team1Goals: team1Goals ? team1Goals : match.team1Goals,
                        team2Goals: team2Goals ? team2Goals : match.team2Goals,
                        team1Logo: team1Logo ? team1Logo : match.team1Logo,
                        team2Logo: team2Logo ? team2Logo : match.team2Logo,
                    }).then(async () => {
                        if(team1Logo != undefined) {
                            arrayLogos.push(team1Logo)
                        }
    
                        if(team2Logo != undefined) {
                            arrayLogos.push(team2Logo)
                        }
    
                        for (let i = 0; i < arrayLogos.length; i++) {
                            const oldDir = path.join(pathDir, "public", "temp", arrayLogos[i])
                            const previousSaved = path.join(pathDir, "public", "uploads", "bets", BetId.toString(), "matches", match.dataValues.id.toString())
                            const newDir = previousSaved
                            fs.rm(previousSaved, {recursive: true}, function() {
                                fs.mkdir(newDir, { recursive: true }, async (err) => {
                                    if (err) {
                                        await t.rollback()
                                        throw err
                                    } else {
                                        fs.rename(oldDir, `${newDir}/${arrayLogos[i]}`, async (err) => {
                                            if (err) {
                                                await t.rollback()
                                                throw err
                                            }
                                        })
                                    }
                                })
                            })
                        }

                        await t.commit()
                        res.status(200).json({
                            "msg": "Match was successfully updated.",
                            team1Name,
                            team2Name,
                            team1Goals,
                            team2Goals,
                            team1Logo,
                            team2Logo,
                            BetId
                        })
                    }).catch(async (error) => {
                        res.status(400).json({
                            "msg": "There was an error trying to update the match.",
                            // this is a way to translate error messages to String
                            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
                        })
                        // if there was an error, the table will be removed/rolled back
                        await t.rollback()
                    })

                }
            })
        })
    } catch (error) {
        res.status(400).json({
            "msg": "There was an error trying to uptade the match.",
            // this is a way to translate error messages to String
            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        })
    }
})


// router to delete matches and the respective images from database
router.delete("/match/:betID/:matchID", async (req, res) => {

    try {
        const t = await connection.transaction()

        const betID = req.params.betID
        const matchID = req.params.matchID
        const matchPath = path.join(pathDir, "public", "uploads", "bets", betID, "matches", matchID)

        Match.findOne({
            where: {
                id: matchID,
                BetId: betID
            }
        }).then(async (match) => {
            if (match != undefined) {
                await match.destroy()
                fs.rm(matchPath, { recursive: true }, async function () {
                    res.status(200).json({
                        status: "Success to delete match.",
                    })
                    await t.commit()
                })
            }
        }).catch(async (error) => {
            res.status(400).json({
                "message": "Error trying to delete the match.",
                "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            })
            await t.rollback()
        })
    } catch (error) {
        res.status(400).json({
            "message": "Error trying to get the match.",
            "error": JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        })
    }
})

function deleteOnError() {
    fs.rm()
}

module.exports = router