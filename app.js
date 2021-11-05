const express = require('express');
const morgan = require('morgan');

// Routes
const toursRouter = require('./routes/toursRouter');
const usersRouter = require('./routes/usersRouter');

const app = express();

//** Middleware */
app.use(morgan('dev'));
app.use(express.json());

//** Routers */
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

module.exports = app;
