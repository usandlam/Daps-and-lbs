const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const dapSchema = new Schema(
  {
    to: { type: Schema.Types.ObjectId, ref: "User", default: null },
    from: { type: Schema.Types.ObjectId, ref: "User", default: null },
    // ?? maybe? ip:
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
