const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelsSchema = new Schema(
  {
    rateHawkId: {
      type: String,
      required: true,
    },
    tripAdvisorLocationId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      required: true,
    },
    totalNumberOfReviews: {
      type: Number,
      required: true,
    },
    summaryReviews: {
      type: Map,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Hotels', hotelsSchema);
