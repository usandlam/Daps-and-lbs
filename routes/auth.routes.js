const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const saltRounds = 10;

const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

// POST  /auth/signup
router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;

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
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.status(400).json({ message: "Username invalid" });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createUser = await User.create({
      username,
      password: hashedPassword,
    });
    const newUser = {
      username: createUser.username,
      name: createUser.name,
      id: createUser._id,
    };
    res.status(201).json({ user: newUser });
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (password === "" || username === "")
    return res.status(400).json({ message: "Provide username and password." });
  try {
    const findUser = await User.findOne({ username });
    const verifyHash = bcrypt.compareSync(password, findUser.password);
    if (verifyHash) {
      const { _id, username } = findUser;
      const payload = { _id, username };
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      return res.status(200).json({ authToken });
    }
    return res.status(401).json({ message: "Unable to authenticate the user" });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "User not found." });
  }
});
/*
// POST  /auth/login
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // Check if username or password are provided as empty string
  if (password === "") {
    res.status(400).json({ message: "Provide username and password." });
    return;
  }

  // Check the users collection if a user with the same username exists
  User.findOne({ username })
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
        const { _id, useraccount } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, useraccount };

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
*/

// GET  /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json(req.payload);
});

module.exports = router;
