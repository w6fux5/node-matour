const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Middleware
const checkId =
  ('id',
  (req, res, next, val) => {
    console.log(`Tour ID is ${val}`);

    const id = val * 1;
    const tour = tours.find(el => el.id === id);

    if (id >= tours.length || !tour)
      return res.json({
        status: 'fail',
        message: 'Invalid ID',
      });

    next();
  });

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }

  next();
};

// Apis
const getAllTours = (req, res) => {
  res.json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1; // 轉換成數字
  const tour = tours.find(el => el.id === id);

  res.json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newId = tours.length;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(`${__dirname}`, JSON.stringify(tours), err => {
    // 201 創建新資源
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
    console.log(err);
  });
};

const updateTour = (req, res) => {
  res.json({
    status: 'success',
    data: {
      tour: '<update tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

module.exports = {
  checkId,
  checkBody,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
};
