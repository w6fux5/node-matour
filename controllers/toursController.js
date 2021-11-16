const Tour = require('../models/tourModel');

//** getAllTours */
// @desc    Get all tours
// @route   Get  /api/v1/tours
// @access  Public
const getAllTours = async (req, res) => {
  console.log(req.query);

  try {
    //** 建立query */
    // 1A) Filtering
    // 如果req.query有包含'page', 'sort', 'limit', 'fields' 以上這些屬性就把它刪除
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filter
    // http://192.168.2.3:5000/api/v1/tours?price[gte]=1200&duration[gte]=5
    // gte:大於等於, gt:大於, lte:小於等於, lt:小於
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // 將gte, gt, lte, lt替換成$gte, $gt, $lte, $lt

    // 2) Sorting
    // http://192.168.2.3:5000/api/v1/tours?sort=-price,-ratingsAverage
    // - 代表由大到小
    // 如果不指定排列方式,默認最新創建的tour在最上面

    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    // http://192.168.2.3:5000/api/v1/tours?fields=name,duration,price
    // 只返回 name,duration,price 這三個欄位
    // 前面帶負號表示不要返回這個屬性,例如 -name, -duration, -price

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      // __v是mongodb內建的屬性,這邊預設返回時不要帶有__v這個屬性,前面的 - 負號 代表不要返回這個屬性
      query = query.select('-__v');
    }

    // 4) 分頁
    // http://192.168.2.3:5000/api/v1/tours?page=2&limit=10
    // skip()代表要跳過幾筆數據
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 當跳過的比數大於數據總比數,則返回錯誤
    if (req.query.page) {
      const toursNum = await Tour.countDocuments();
      if (skip >= toursNum) throw new Error('This page does not exists');
    }

    //** 執行query */
    const tours = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    console.log(error);
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
