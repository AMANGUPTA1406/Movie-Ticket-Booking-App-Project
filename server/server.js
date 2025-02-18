const express = require('express');
const app = express();
//using cookie parser to use cookie and fetch from it
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theaterRoutes = require('./routes/theaterRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cors = require('cors');
dotenv.config();

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/dbconnect");
connectDB();

console.log("Hello World");
// Middleware
app.use(express.json());
app.use(cors());

const bodyParser = require ('body-parser');
app.use(bodyParser.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, ()=>{
    console.log(`App is listening to port ${PORT} .`);
})