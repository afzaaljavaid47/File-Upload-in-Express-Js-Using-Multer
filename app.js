var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var hbs=require('hbs');
require('dotenv').config()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var signupRouter = require('./routes/signup');
var logoutRouter = require('./routes/logout');
var filesRouter = require('./routes/files');
var emailRouter = require('./routes/email');
var downloadRouter = require('./routes/download');
var mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('Connected to DB'))
.catch((err)=>console.log("Error connecting to DB. Error : ",err))
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var partialsPath=path.join(__dirname,'./partials');
hbs.registerPartials(partialsPath);
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/logout', logoutRouter);
app.use('/files',filesRouter);
app.use('/download',downloadRouter);
app.use('/email',emailRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
