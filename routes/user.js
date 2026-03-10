const express=require('express');
const router=express.Router({mergeParams:true});
const User=require('../models/user.js');
const wrapAsync=require('../utils/wrapAsync.js');
const passport=require('passport');
const {saveRedirectURL}=require('../middleware.js');

const userController=require("../controllers/users.js");

router
.route('/signup')
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router
.route('/login')
.get(userController.renderLoginForm)
.post(saveRedirectURL,
    passport.authenticate('local',{
    failureFlash:true,
    failureRedirect:'/login',
}),
 userController.login
);

router.get('/logout',userController.logout);

module.exports=router;