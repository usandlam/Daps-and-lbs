const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const router = express.Router();
const saltRounds = 10;

const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST  /auth/signup
// ...
router.post("/signup", async (req, res, next) => {
  const { name, password } = req.body;

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.status(400).json({ message: "Email invalid" });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createUser = await User.create({
      password: hashedPassword,
      name,
    });
    const newUser = {
      email: createUser.email,
      name: createUser.name,
      id: createUser._id,
    };
    res.status(201).json({ user: newUser });
  } catch (err) {
    console.log(err);
  }
});

// POST  /auth/login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, name } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name };

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Internal Server Error" });
      console.log(err);
    });
});

// GET  /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  // console.log(`req.payload`,req.payload);
  res.status(200).json(req.payload);
});

module.exports = router;
