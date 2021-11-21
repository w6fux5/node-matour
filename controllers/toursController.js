const APIFeatures = require('../utils/apiFeatures');

const Tour = require('../models/tourModel');

// Helpers
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// MiddleWare
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//** getAllTours */
// @desc    Get all tours
// @route   Get  /api/v1/tours
// @access  Public
const getAllTours = catchAsync(async (req, res, next) => {
  //** 執行query */
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const tours = await features.query;

  // Send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

//** getTour */
// @desc    Get tour by ID
// @route   Get  /api/v1/tours/:id
// @access  Public
const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
    // throw new AppError('Tour not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//** createTour */
// @desc    Create a new tour
// @route   POST /api/v1/tours
// @access  Public
const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

//** updateTour */
// @desc    Update tour by ID
// @route   PATCH /api/v1/tours/:id
// @access  Public
const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
    // throw new AppError('Tour not found', 404);
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//** deleteTour */
// @desc    Delete tour by ID
// @route   Delete /api/v1/tours/:id
// @access  Public
const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
    // throw new AppError('Tour not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//** get tour stats */
// @desc    aggregate pipeline, note: 路由需放在/:id路由的前面
// @route   Delete /api/v1/tours/tour-stats
// @access  Public
const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id分組類型, null代表不分組
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' }, // $toUpper => 變成大寫
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // Pipeline 可以重複
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // 新增month欄位
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      // 不顯示_id
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,

  aliasTopTours,
};
