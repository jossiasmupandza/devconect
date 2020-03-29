const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../modules/User');
const Post = require('../../modules/Post');

//@route    POST api/posts
//@desc     add a post
//@acess    private
router.post("/", [
    auth,
    check('text','Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});

    try {
        const user = await User.findById(req.user.id).select('-password');

       const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        await newPost.save();

        res.json(newPost);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: " + error.message);
    }
});

//@route    GET api/posts
//@desc     Get all posts
//@acess    private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: " + error.message);
    }
});

module.exports = router;
 