var express = require('express');
var router = express.Router();
var User = require("../models/User");
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  const { DEVELOPMENT_HOST, PRODUCTION_HOST, IS_PRODUCTION, PORT } = process.env;
  const routeData = {
    mainURL: `${IS_PRODUCTION == "true" ? PRODUCTION_HOST : DEVELOPMENT_HOST + ':' + PORT}`
  }


/* GET users listing. */
router.get('/users', require("connect-ensure-login").ensureLoggedIn("/auth/login"),function (req, res) {
  User.find().select("-password").exec((err, users) => {
    if (err) { return done(err); }
    res.json(users);
  });
});

/* Register a user. */
router.post('/add',require("connect-ensure-login").ensureLoggedIn("/auth/login"), function (req, res) {
  let role = "admin";
  let { username, password, first_name, last_name ,email} = req.body;
  new User({ username, password, role, first_name, last_name,email }).save((err, user) => {
    if (err) { return res.json(err); }
    res.json({
      result: true,
      user
    });
  });
});

/* Login route */
router.post('/doLogin',
  passport.authenticate('local', {
    successRedirect: '/panel',
    failureRedirect: '/auth/login',
    successFlash: 'Welcome!',
    failureFlash: "Username or password is incorrect! Please try agarin!"
  }),
  (req, res) => {
    res.redirect("/panel/")
  }
);

/* Login page route */
router.get('/login',
  (req, res) => {
    res.render("admin/pages/login",{ ...routeData, page: 'login', pageTitle: "Login" });
  }
);

/* Logout page route */
router.get('/logout',
  (req, res) => {
    req.logout();
    res.redirect('/auth/login');
  }
);


/* delete a user. */
router.delete( '/user/delete/:_id', function ( req, res )
{
  let { _id } = req.params;

  User.findOne( { _id } ).remove().exec( function ( err, result )
  {
    err ?
      res.json( {
        result: "Sorry, An unknown error has occured!"
      } )
      :
      res.json( result )
  } )
} );

module.exports = router;