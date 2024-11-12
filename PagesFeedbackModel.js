const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pagesFeedbackSchema = new Schema(
  {
    page: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('PagesFeedback', pagesFeedbackSchema);
