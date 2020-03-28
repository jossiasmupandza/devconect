const express = require('express');
const router = express.Router();
const config = require('config');
const request = require('request');
const {check, validationResult} = require('express-validator');

const auth = require('../../middleware/auth');
const Profile = require('../../modules/Profile');

//@route    GET api/profile/me
//@desc     Get user logged in profile
//@acess    Privite
router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name','avatar']);

        if(!profile) {
            return res.status(400).json({msg:'There are no profiles for this user'});
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    POST api/profile
//@desc     Creat or Update a profile
//@acess    Private
router.post('/', [ auth, [
        check('status','Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    //get's data from reqest
    const {
        degree,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body
    
    //build profile object
    const profileFilds = {};
    profileFilds.user = req.user.id;
    if(degree) profileFilds.company = company;
    if(website) profileFilds.website = website;
    if(location) profileFilds.location = location;
    if(bio) profileFilds.bio = bio;
    if(status) profileFilds.status = status;
    if(githubusername) profileFilds.githubusername = githubusername;
    //converts skills to an array (ex: php,js, java,)
    if(skills) profileFilds.skills = skills.split(',').map(skill => skill.trim());

    //build social object
    profileFilds.social = {};
    if(youtube) profileFilds.social.youtube = youtube;
    if(facebook) profileFilds.social.facebook = facebook;
    if(twitter) profileFilds.social.twitter = twitter;
    if(instagram) profileFilds.social.instagram = instagram;
    if(linkedin) profileFilds.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({user: req.user.id});

        if(profile) {
            //update profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFilds },
                { new: true}
            );
            return res.json(profile);
        }

        //create
        profile = new Profile(profileFilds);
        await profile.save();
        return res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: " + error.message);
    }

});

//@route    GET api/profile
//@desc     Get all users profile
//@acess    Public
router.get("/", async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error: ");
    }
});


//@route    GET api/profile/user/:user_id
//@desc     Get profile by id
//@acess    Public
router.get("/user/:user_id", async (req, res) => {
    try {
        const profile = await Profile.find({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        
        if(!profile)
            return res.status(400).json({msg: "Profile not found"});

        return res.json(profile);

    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId')
            return res.status(400).json({ msg: "Profile not found" });
        res.status(500).send("Server error: ");
    }
});

//@route    DELETE api/profile
//@desc     delete user, profile and post
//@acess    Private
router.delete("/", auth, async (req, res) => {
    try {
        //@todo - remove
        
        //remove profile
        await Profile.findOneAndRemove({user: req.user.id});

        //remove user
        await User.findOneAndRemove({id: req.user.id});

        return res.json({msg: "User deleted"});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

//@route    PUT api/profile/experience => we use put to update an existing field
//@desc     Add's expirience in profile
//@acess    Private
router.put('/experience', [ auth, [
    check('title','Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors)
        return res.status(400).json({ errors: errors.array() });
    
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        descripition
    } = req.body;

    //creat's object with the data that the user submited
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        descripition
    };

    try {
        const profile = await Profile.findOne({user: req.user.id});
        if(!profile)
            return res.status(400).json({msg: "There are no profiles for this user"});
       
        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: '+error.message);
    }

});

//@route    DELETE api/profile/experience/:exp_id
//@desc     delete user, profile and post
//@acess    Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        //remove index
        profile.experience.splice(removeIndex, 1);

        await profile.save();

        return res.json({ msg: "Experience removed from profile" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error" + error.message);
    }
});


//@route    PUT api/profile/education => we use put to update an existing field
//@desc     Add's education in profile
//@acess    Private
router.put('/education', [auth, [
    check('school', 'Title is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors)
        return res.status(400).json({ errors: errors.array() });

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        descripition
    } = req.body;

    //creat's object with the data that the user submited
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        descripition
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile)
            return res.status(400).json({ msg: "There are no profiles for this user" });

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error: ' + error.message);
    }

});

//@route    DELETE api/profile/education/:exp_id
//@desc     delete user, profile and post
//@acess    Private
router.delete("/education/:edu_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        //remove index
        profile.education.splice(removeIndex, 1);

        await profile.save();

        return res.json({ msg: "education removed from profile" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error" + error.message);
    }
});

//@route    GET api/profile/github/:username
//@desc     Get user's repositories
//@acess    PublicPrivate
router.get("/github/:username", (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js'} 
        };

        request(options, (error, response, body) => {
            if(error) 
                console.error(erorr.message);
            
            if(response.statusCode !== 200)
                return res.status(404).json({msg: "No github profile found"});

            res.json(JSON.parse(body));
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error" + error.message);
    }
});

module.exports = router;
