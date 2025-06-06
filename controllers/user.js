// Dependencies and Modules
const bcrypt = require("bcrypt");
const User = require('../models/User');
const auth = require("../auth");
const { errorHandler } = auth;

//User Registration
module.exports.registerUser = (req, res) => {

  // Checks if the email is in the right format
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ message: 'Email invalid' });
  }

  // Checks if the password has atleast 8 characters
  else if (req.body.password.length < 8) {
    return res.status(400).send({ message: 'Password must be atleast 8 characters' });
    // If all needed requirements are achieved
  } else {
    let newUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 10),
      isAdmin: req.body.isAdmin
    })

    return newUser.save()
      .then((result) => res.status(201).send({
        message: 'Registered successfully'
      }))
      .catch(error => errorHandler(error, req, res));
  }
};

// Login User
module.exports.loginUser = (req, res) => {
  if (req.body.email.includes("@")) {
    return User.findOne({ email: req.body.email })
      .then(result => {
        if (!result) {
          return res.status(404).json({ message: 'No Email Found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
        if (isPasswordCorrect) {
          const token = auth.createAccessToken(result);

          // Ensure the token is inside `access` property
          return res.status(200).json({ access: token });
        } else {
          return res.status(401).json({ message: 'Email and password do not match' });
        }
      })
      .catch(error => errorHandler(error, req, res));
  } else {
    return res.status(400).json({ message: 'Invalid email' });
  }
};

// User details
module.exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token
    const user = await User.findById(userId).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};