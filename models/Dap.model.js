const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const dapSchema = new Schema(
  {
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Dap", dapSchema);
