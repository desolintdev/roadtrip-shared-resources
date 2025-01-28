const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stopsSchema = new Schema({
  _id: false,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
  },
});

const guidesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stops: {
      type: [stopsSchema],
      required: true,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Guides', guidesSchema);
