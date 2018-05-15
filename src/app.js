const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
// const compress = require('compression');
const index = require('./routes/index.route');

const users = require('./routes/user.route');
const chat = require('./routes/chat.route');
const static = require('./routes/static.route');
const io = require('./socket.io');

const app = express();
app.io = io;

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'development';


// view engine setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: {
    block: function(name, options) {
      const blocks = this._blocks,
        content = blocks && blocks[name];
      return content ? content.join('\n') : null;
    },
    contentFor: function(name, options) {
      const blocks = this._blocks || (this._blocks = {}),
        block = blocks[name] || (blocks[name] = []);
      block.push(options.fn(this));
    },
  },

}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
// app.use(cookieParser());
// app.use(compress());

// for sharing this io object throughout the application
// app.use(function(req, res, next) {
//   res.io = io;
//   next();
// });
app.use('/', index);
// app.use('/users', users);
app.use('/chat', chat);
app.use('/static', static);

// /catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// / error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error',
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'error',
  });
});

module.exports = app;
