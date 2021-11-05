const app = require('./app');

//** Start Server */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
