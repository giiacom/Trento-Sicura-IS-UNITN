require('dotenv').config(); 
const express = require("express");
const dbConfig = require('./db');
const routes = require('./routes');
const cors = require('cors');


const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

dbConfig.connect();

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  