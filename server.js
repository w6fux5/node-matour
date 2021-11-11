const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<password>', process.env.DATABASE_PWD);

mongoose
  .connect(db, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
  .then(con => {
    console.log('DB connection successful');
    // console.log(con.connection);
  });

// console.log(process.env);
// console.log(app.get('env'));

const app = require('./app');

//** Start Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
