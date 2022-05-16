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

//

const regex = /([\u180B-\u180D\uFE00-\uFE0F]|\uDB40[\uDD00-\uDDEF])/g;

const stripVariationSelectors = function (string) {
  return string.replace(regex, "");
};

//

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/:tag", async (req, res, next) => {
  const { tag } = req.params;
  //   const decoded = { url: emojiUnicode(tag) };
  const decoded = { url: stripVariationSelectors(tag) };

  const query = { url: { $eq: tag } };

  try {
    console.log("doing lookup", decoded);
    // const lookupUrl = await Tag.findOne({ url: decoded });
    // const lookupUrl = await Tag.findOne(decoded);
    const lookupUrl = await Tag.findOne(query);
    console.log(lookupUrl);
    console.log({ url: decoded });
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

router.post("/tag", isAuthenticated, async (req, res, next) => {
  const user = req.payload.foundUserId;
  const { tag, owner } = req.body;
  const encoded = stripVariationSelectors(tag);

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
