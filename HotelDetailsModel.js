const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelDetailsSchema = new Schema(
  {
    provider: {
      type: String,
    },
    address: {
      type: String,
    },
    checkInTime: {
      type: String,
    },
    checkOutTime: {
      type: String,
    },
    hasParking: {
      type: Boolean,
    },
    hasAirConditioning: {
      type: Boolean,
    },
    hasPets: {
      type: Boolean,
    },
    hasInternet: {
      type: Boolean,
    },
    images: {
      type: [String],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    paymentMethods: {
      type: [String],
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    roomGroups: {
      type: [Map],
    },
    providerDetails: {
      type: Map,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('HotelDetails', hotelDetailsSchema);
