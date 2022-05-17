const router = require("express").Router();

const jwt = require("jsonwebtoken");
//
const emojiUnicode = require("emoji-unicode");
// const toEmoji = require("emoji-name-map");
//

const Dap = require("../models/Dap.model");

const User = require("../models/User.model");

const Tag = require("../models/Tag.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

const cleanEmoji = require("../scripts/VariationSelectors");

const bogusFilter = require("../scripts/BogusFilter");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/:tag", async (req, res, next) => {
  const { tag } = req.params;
  const query = { url: { $eq: cleanEmoji(tag) } };

  try {
    console.log("doing lookup", query);
    const lookupUrl = await Tag.findOne(query).populate(
      "owner",
      "username tagline"
    );
    console.log(lookupUrl);

    res.status(200).json({ message: lookupUrl });
  } catch (error) {
    res.status(404).json("All good in here");
  }
});

router.post("/p", async (req, res, next) => {
  const { tag } = req.body;
  console.log(tag);
  const unicodeTag = emojiUnicode(tag);

  const query = { url: { $eq: tag } };

  try {
    const lookupUrl = await Tag.findOne({ url: { $eq: unicodeTag } });

    res.status(200).json({ message: lookupUrl });
  } catch (error) {
    res.status(404).json("All good in here");
  }
});

router.post("/tagline", isAuthenticated, async (req, res, next) => {
  const user = req.payload.foundUserId;
  const { tagline, owner } = req.body;
  if (user !== owner) {
    res.status(401).json({ error: "Failed to authenticate, user mismatch" });
    return;
  }
  const query = { _id: user };
  const cleanTagline = { tagline: bogusFilter(tagline) };

  try {
    const updateTagline = await User.findOneAndUpdate(query, cleanTagline);
    console.log(updateTagline);
    res.status(200).json({ newTagline: cleanTagline.tagline });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/tag", isAuthenticated, async (req, res, next) => {
  const user = req.payload.foundUserId;
  const { tag, owner } = req.body;
  const encoded = cleanEmoji(tag);

  if (user !== owner) {
    res.status(401).json({ error: "Failed to authenticate, user mismatch" });
    return;
  }
  try {
    const lookupUrl = await Tag.findOne({ url: encoded });
    if (lookupUrl) {
      res.status(400).json({ message: "Tag taken" });
      return;
    }
    const hasUrl = await Tag.findOne({ owner: user });
    if (hasUrl) {
      // user has existing URL, update it
      const currentUrl = hasUrl._id;
      const updateUrl = await Tag.findOneAndUpdate(
        { currentUrl },
        { url: encoded }
      );
      res.status(201).json({ message: "Success" });
      return;
    }
    const registerUrl = await Tag.create({ url: encoded, owner: user });
    res.status(201).json({ message: "Success" });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json(error.toString());
  }
});

module.exports = router;
