const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentsSchema = new Schema(
  {
    screen: {
      type: String,
      required: true,
    },
    reviewType: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Comments', commentsSchema);
