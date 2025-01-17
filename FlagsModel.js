const mongoose = require('mongoose');
const {FLAG_TYPES_KEYS_ARR} = require('./constants');
const Schema = mongoose.Schema;

const flagsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    type: {
      type: String,
      enum: FLAG_TYPES_KEYS_ARR,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Flags', flagsSchema);
