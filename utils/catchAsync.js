module.exports = fn => (req, res, next) => {
  // fn(req, res, next).catch(err => next(err));
  fn(req, res, next).catch(next); // 縮寫,和上面一樣
};
