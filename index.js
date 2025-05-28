// Dependencies and Modules
const express = require('express');
const mongoose = require('mongoose');

// Allows our backend application to be available to our frontend application
// Allows us to control the app's Cross Origin Resource Sharing settings
const cors = require("cors")

// Routes
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");


// Environment Setup
require('dotenv').config();

// Server Setup
// Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: [
    'http://localhost:3000'

  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options('/', cors(corsOptions));
app.get("/test", (req, res) => {
  res.json({ message: "CORS test passed" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas."));

// Backend Routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

// Server Gateway Response
// if(require.main) would allow us to listen to the app directly if it is not imported to another module, it will run the app directly.
// else, if it is needed to be imported, it will not run the app and instead export it to be used in another file.
if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online on port ${process.env.PORT || 3000}`)
  });
}

module.exports = { app, mongoose };