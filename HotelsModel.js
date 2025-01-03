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
      type: String,
      required: true,
    },
    totalNumberOfReviews: {
      type: String,
      required: true,
    },
    summaryReviews: {
      type: Map,
    },
    details: {
      type: mongoose.Types.ObjectId,
      ref: 'HotelDetails',
    },
    detailsLastUpdated: {
      type: Date,
      default: Date.now(),
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Hotels', hotelsSchema);
