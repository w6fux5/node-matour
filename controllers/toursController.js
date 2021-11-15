const Tour = require('../models/tourModel');

//** getAllTours */
// @desc    Get all tours
// @route   Get  /api/v1/tours
// @access  Public
const getAllTours = async (req, res) => {
  try {
    //** 建立query */
    // 1A) Filtering
    // 如果req.query有包含'page', 'sort', 'limit', 'fields',就把它刪除
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filter
    // gte:大於等於, gt:大於, lte:小於等於, lt:小於
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // 2) Sorting
    // 如果不指定排列方式,默認最新創建的tour在最上面
    console.log(req.query);

    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //** 執行query */
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    const allTours = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: { tours: allTours },
    });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

//** getTour */
// @desc    Get tour by ID
// @route   Get  /api/v1/tours/:id
// @access  Public
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

//** createTour */
// @desc    Create a new tour
// @route   POST /api/v1/tours
// @access  Public
const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid request.',
    });
  }
};

//** updateTour */
// @desc    Update tour by ID
// @route   PATCH /api/v1/tours/:id
// @access  Public
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    console.log(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

//** deleteTour */
// @desc    Delete tour by ID
// @route   Delete /api/v1/tours/:id
// @access  Public
const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
};
