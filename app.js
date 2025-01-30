const express = require("express");
const dbConfig = require('./db');
const routes = require('./routes');
require('dotenv').config();


const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

dbConfig.connect();

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  