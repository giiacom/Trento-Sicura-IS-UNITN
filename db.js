const mongoose = require('mongoose');
/*
// Function to connect to MongoDB
const connect = () => {
  mongoose.connect('mongodb://127.0.0.1:27017/provadb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
};

module.exports = { connect };*/
require('dotenv').config(); // Load env variables

const connect = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));
};
module.exports = { connect };