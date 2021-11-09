const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(process.env);
// console.log(app.get('env'));

//** Start Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
