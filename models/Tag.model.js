const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const TagSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", default: null },
  url: { type: String, default: "" },
});

module.exports = model("Tag", TagSchema);
