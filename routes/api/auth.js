const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../modules/User')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const router = express.Router();

//@route    GET api/auth
//@desc     Authetication route
//@acess    public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    POST api/auth
//@desc     Autheticate user e get token
//@acess    public
router.post("/", [
        check('email','Please insert a valid email').isEmail(),
        check('password','password is required').exists()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        
        //geting data from request
        const {email, password} = req.body;

        try {
            //check if user exists
            let user = await User.findOne({email}); //anything that returns data we must put await beacause we are using async method
            if(!user) {
                return res.status(400).json({errors: {msg: "Invalid credentials"}})
            }

            //copare password
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
              return res.status(400).json({errors: {msg: "Invalid credentials"}})  
            }

            //return jsonwebtoken -> to confirm tha the user is registrated and ready form login
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn:36000},
                (err, token) => {
                    if(err) throw err;
                    res.json({token});
                }
            );

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error: "+error.message);
        }
    }
);

module.exports = router;
