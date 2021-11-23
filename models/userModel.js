const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],

    // 只有當 .create() .save()才會有效, update時無效
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: '兩次密碼不一樣',
    },
  },
});

userSchema.pre('save', async function (next) {
  // 數據保存前確認密碼這個欄位是否有修改, 如果沒有修改,就直接call next(),
  // 若是密碼有修改,則將密碼加密
  if (!this.isModified('password')) return next();

  // hash the password with cost 12, 設定得越高,越消耗cpu效能
  this.password = await bcrypt.hash(this.password, 12);

  // 確認密碼這個欄位不需要保存到數據庫
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
