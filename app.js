require('dotenv').config(); 
const express = require("express");
const dbConfig = require('./db');
const user = require('./user/userRoutes');
const reports = require('./report/reportRoutes');
const cors = require('cors');
const path = require('path'); 

const app = express();
app.use(express.static(path.join(__dirname, 'frontend'))); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'registra.html'));
});

const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://trento-sicura-is-unitn.onrender.com' // Allow only the deployed frontend in production
    : 'http://localhost:4000', // Allow localhost for local development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));  // Apply the CORS configuration

app.use(express.json());
//app.use(cors());
app.use(express.urlencoded({ extended: true })); 


dbConfig.connect();

app.use('/api', user);
app.use('/api', reports);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  