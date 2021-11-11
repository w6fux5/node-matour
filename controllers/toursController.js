const Tour = require('../models/tourModel');

//** */ Apis
// @desc    Get all tours
// @route   Get  /api/v1/tours
// @access  Public
const getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: { tours: allTours },
    });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

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
