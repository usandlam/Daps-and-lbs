const router = require("express").Router();

const Dap = require("../models/Dap.model");

const { isLoggedIn } = require("../middleware/jwt.middleware");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/daps", async (req, res, next) => {
  try {
    const allDaps = await Dap.find();
    res.json(allDaps);
  } catch (error) {
    // for dev:
    console.log(error);
    //
    res.status(400).json({ error });
  }
});

router.post("/dap", isLoggedIn, async (req, res, next) => {
  let from;
  if (req.payload) {
    from = req.payload.foundUserId;
  } else from = null;
  const { latitude, longitude } = req.body;

  try {
    const newDap = await Dap.create({
      location: { type: "Point", coordinates: [latitude, longitude] },
      from,
    });
    res.status(201).json({ created: { id: newDap._id, at: newDap.createdAt } });
  } catch (error) {
    // for dev:
    console.log(error);
    //
    res.status(400).json({ error });
  }
});

module.exports = router;
