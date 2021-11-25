const express = require('express');

const morgan = require('morgan');

// Helpers
const AppError = require('./utils/appError');

// Controllers
const errorController = require('./controllers/errorController');

// Routes
const toursRouter = require('./routes/toursRouter');
const usersRouter = require('./routes/usersRouter');

const app = express();

//** Middleware */
if (process.env.NODE_DEV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//** Routers */
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error Handler
app.use(errorController);

console.log(process.env.NODE_ENV);
module.exports = app;
