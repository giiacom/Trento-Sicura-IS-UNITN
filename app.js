require('dotenv').config(); 
const express = require("express");
const dbConfig = require('./db');
const user = require('./user/userRoutes');
const reports = require('./report/reportRoutes');
const cors = require('cors');


const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); //PROVA ------> Forse da eliminare


dbConfig.connect();

app.use('/api', user);
app.use('/api', reports);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  