const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal then 50 characters'],
      minLength: [3, 'A tour name must have more or equal then 3 characters'],
      validate: {
        validator: function (val) {
          return validator.isAlpha(val.split(' ').join(''));
        },
        message: 'Tour name must only contain characters.',
      },
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be below 5.0'],
      min: [1, 'Rating must be above 1.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price ({VALUE}) should be below regular price.', // {VALUE} 可以直接訪問到request裡面給的priceDiscount的value

        // 只有當新的document創建時, this才會指向當前的document
        // this only point to current doc on new doc creation.
        validator: function (val) {
          return this.price > val; // 原始價格大於折後返回true, 原始價格小於折扣返回false
        },
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String], // array裡面必須是string

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 將持續時間由天數轉換為週數後返回給client
// 這裡不會保存到數據庫
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//==== Document middleware:
/*
1.runs before .save() and .create()
2.這裡的this 指向要保存的document
3.在保存前插入一個 slug欄位,value是this.name, 並且轉為小寫
*/

// 保存到數據庫前前
tourSchema.pre('save', function (next) {
  console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// document保存完畢後觸發
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

//==== Query middleware
/*
1. /^find/ 的意思是  .find()  .findOne 都會觸發
2. this指向query物件
*/

// 查詢前
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = new Date(); //開始查詢的時間
  next();
});

// 查詢後
tourSchema.post(/^find/, function (docs, next) {
  console.log(`這個查詢共耗費${new Date() - this.start}毫秒`);
  next();
});

//==== Aggregation middle
/*
1. this指向當前的聚合物件 console.log(this.pipeline())
2. this.pipeline是一個array
3. 使用unshift 在最前面增加一個查詢條件
4. 增加一個match,條件是 secretTour不等於true
*/

// 聚合操作前
tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
