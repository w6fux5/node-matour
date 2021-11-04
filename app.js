const express = require('express');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());

const PORT = 5000;

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// console.log(tours.length);

app.get('/api/v1/tours', (req, res) => {
  res.json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours.length;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 201 創建新資源
      res.status(201).json({
        status: 'success',
        data: { tour: newTour },
      });
      console.log(err);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
