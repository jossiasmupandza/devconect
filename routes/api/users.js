const express = require("express");
const router = express.Router();

//@route    POST api/user
//@desc     Register user
//@acess    public
router.post("/", (req, res) => {
    console.log(req.body);
    res.send("User route");
});
module.exports = router;
