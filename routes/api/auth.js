const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../modules/User')
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

module.exports = router;
