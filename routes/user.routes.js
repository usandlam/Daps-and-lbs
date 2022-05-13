const router = require("express").Router();

const jwt = require("jsonwebtoken");
const Dap = require("../models/Dap.model");

const User = require("../models/User.model");

const Tag = require("../models/Tag.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/:tag", async (req, res, next) => {
  const { tag } = req.params;
  try {
    const lookupUrl = await Tag.findOne({ url: tag }).populate(
      "owner",
      "username"
    );
    console.log(lookupUrl);
    res.status(123).json("All good in here");
  } catch (error) {}
});

router.post("/tag", isAuthenticated, async (req, res, next) => {
  const user = req.payload.foundUserId;
  const { tag, owner } = req.body;
  if (user !== owner) {
    res.status(401).json({ error: "Failed to authenticate, user mismatch" });
    return;
  }
  try {
    const lookupUrl = await Tag.findOne({ url: tag });
    if (lookupUrl) {
      res.status(401).json({ message: "Tag taken" });
      return;
    }
    const hasUrl = await Tag.findOne({ owner: user });
    if (hasUrl) {
      // user has existing URL, update it
      const currentUrl = hasUrl._id;
      const updateUrl = await Tag.findOneAndUpdate(
        { currentUrl },
        { url: tag }
      );
      res.status(201).json({ message: "Success" });
      return;
    }
    const registerUrl = await Tag.create({ url: tag, owner: user });
    res.status(201).json({ message: "Success" });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json(error.toString());
  }
});

// You put the next routes here 👇
// example: router.use("/auth", authRoutes)

module.exports = router;
