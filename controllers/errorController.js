const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `無效的 ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidErrorDb = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrProd = (err, res) => {
  // client端操作錯誤返回的訊息
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // 程式錯誤,第三方package錯誤或其他未知的錯誤操成的異常,只返回通用的訊息給client
  } else {
    // 1) Log Error
    console.error('Error 🔥', err);

    // 2) Send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    // let error = { ...err };
    console.error('Error 🔥', error.name);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);
    if (error.name === 'ValidationError') error = handleValidErrorDb(error);

    sendErrProd(error, res);
  }
};
