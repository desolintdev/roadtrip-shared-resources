const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewsSchema = new Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    tripAdvisorReviewId: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    user: {
      type: Map,
      required: true,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Reviews', reviewsSchema);
