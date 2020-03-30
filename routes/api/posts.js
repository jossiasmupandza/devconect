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

//@route    GET api/posts/:post_id
//@desc     get post by id
//@acess    private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if(!post)
            return res.status(404).json({msg: 'Post not found'});

        res.json(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId')
            return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send("Server error: " + error.message);
    }
});

//@route    DELETE api/posts/:post_id
//@desc     delete post by id
//@acess    private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post)
            return res.status(404).json({ msg: 'Post not found' });

        //check user
        if(req.user.id !== post.user.toString())
            return res.status(401).json({ msg: 'User not authorized' });

        post.remove();

        res.json({msg: 'Post removed'});
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId')
            return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send("Server error: " + error.message);
    }
});

//@route    put api/posts/comment/post_id
//@desc     add a comment to a post
//@acess    private
router.put("/comment/:post_id", [
    auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.post_id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();

        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: " + error.message);
    }
});


//@route    DELETE api/posts/comment/:post_id/:com_id
//@desc     delete comment by id 
//@acess    private
router.delete('/comment/:post_id/:com_id', auth, async (req, res) => {
    try {
        //find the post
        const post = await Post.findById(req.params.post_id);
        if (!post)
            return res.status(404).json({ msg: 'Post not found' });

        //pull out the post
        const comment = post.comments.find( comment => comment.id === req.params.com_id );
        if (!comment)
            return res.status(404).json({ msg: 'Comment does not exist' });

        //check user
        if (req.user.id !== comment.user.toString())
            return res.status(401).json({ msg: 'User not authorized' });

        //get the remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);
        
        post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId')
            return res.status(404).json({ msg: 'Post not found' });
        res.status(500).send("Server error: " + error.message);
    }
});
module.exports = router;
 