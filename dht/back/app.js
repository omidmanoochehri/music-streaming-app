var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var User = require('./models/User');
var flash = require('connect-flash');
cors = require('cors');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
require('./bootstrap/dbConnection');
require('./helpers/hapiServer');
require("./helpers/cron_mp3");
// const NodeMediaServer = require('node-media-server');
// const RtspServer = require('rtsp-streaming-server').default;
// const server = new RtspServer({
//   serverPort: 5554,
//   clientPort: 6554,
//   rtpPortStart: 10000,
//   rtpPortCount: 10000
// });

// async function run() {
//   try {
//     await server.start();
//   } catch (e) {
//     console.error(e);
//   }
// }

// run();
// const config = {
//   rtmp: {
//     port: 1935,
//     chunk_size: 60000,
//     gop_cache: true,
//     ping: 30,
//     ping_timeout: 60,
//     /*
//     ssl: {
//       port: 443,
//       key: './privatekey.pem',
//       cert: './certificate.pem',
//     }
//     */
//   },
//   http: {
//     port: 8000,
//     mediaroot: './media',
//     webroot: './public',
//     allow_origin: '*',
//     api: true
//   },
//   auth: {
//     api: true,
//     api_user: 'admin',
//     api_pass: 'admin',
//     play: false,
//     publish: false,
//     secret: 'nodemedia2017privatekey'
//   }
// };


// let nms = new NodeMediaServer(config)
// nms.run();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoriesRouter = require('./routes/categories');
var podcastsRouter = require('./routes/podcasts');
var artistsRouter = require('./routes/artists');
var liveRouter = require('./routes/live');
var schedulesRouter = require('./routes/schedules');
var panelRouter = require('./routes/panel');

var app = express();

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,access_token,authorization,token');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
// app.use(cors({credentials: true, origin: 'http://localhost:9000'}));
app.use(
  require("express-session")({
      secret: "secret",
      cookie: {  maxAge: 30 * 24 * 60 * 60 * 1000 },
      resave: true,
      saveUninitialized: false
  })
);
passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.password == password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/podcasts', podcastsRouter);
app.use('/artists', artistsRouter);
app.use('/live', liveRouter);
app.use('/schedules', schedulesRouter);
app.use('/panel', panelRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
