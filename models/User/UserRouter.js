const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")

// importing the database User model
const User = require("../User/User")

/* ROUTES
 * get users
 * get one user
 * route to login
*/

// router to register an user
router.post("/user", (req, res) => {

    try {
        // getting the values from requisition
        const username = req.body.username
        const email = req.body.email
        const myPlaintextPassword = req.body.password

        // setting up the salt for encrypt the password with
        const saltRounds = 10
        // encrypting the pass and saving the user to the database
        bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hashedPassword) {
            if(err) {
                res.statusCode(400).json({
                    "msg" : "There was an error on making password hash",
                    "error" : err
                })
            } else {
                User.create({
                    username: username,
                    email: email,
                    password: hashedPassword
                }).then(() => {
                    res.json({
                        "msg" : "User successfully saved into the database .",
                    })
                    res.statusCode = 201
                }).catch((error) => {
                    res.status(400).json({
                        "msg" : "There was an error on making password hash",
                        "error" : error
                    })
                })
            }
        })
    } catch (error) {
        res.status(400).json({
            "msg" : "There was an error trying to save User",
            "error" : err
        })
    }

})

module.exports = router