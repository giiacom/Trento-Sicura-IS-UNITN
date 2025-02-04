require('dotenv').config(); 
const express = require("express");
const dbConfig = require('./db');
const user = require('./user/userRoutes');
const reports = require('./report/reportRoutes');
const cors = require('cors');
const path = require('path'); 



const app = express();
app.use(express.static(path.join(__dirname, 'frontend'))); 


const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); 


dbConfig.connect();

app.use('/api', user);
app.use('/api', reports);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  