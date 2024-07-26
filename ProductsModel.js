const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelsSchema = new Schema({
  name: String,
});

const citiesSchema = new Schema({
  hotels: {
    type: Map,
    of: hotelsSchema,
  },
  address: Map,
});

const packagesSchema = new Schema(
  {
    _id: false,
    cities: {
      type: Map,
      of: Number,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

packagesSchema.virtual('noOfNights').get(function () {
  return Array.from(this.cities.values()).reduce(
    (total, nights) => total + nights,
    0
  );
});

const topicsSchema = new Schema({
  _id: false,
  en: {
    type: String,
    required: true,
  },
  nl: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const featuresSchema = new Schema({
  _id: false,
  en: {
    type: String,
    required: true,
  },
  nl: {
    type: String,
    required: true,
  },
});

const distancesAndDurationsSchema = new Schema({
  _id: false,
  originName: {
    type: String,
    required: true,
  },
  distance: {
    type: Map,
    required: true,
  },
  duration: {
    type: Map,
    required: true,
  },
});

const productsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    cities: {
      type: Map,
      of: citiesSchema,
      required: true,
    },
    packages: {
      type: Map,
      of: packagesSchema,
      required: true,
    },
    topics: {
      type: [topicsSchema],
      required: true,
    },
    features: {
      type: [featuresSchema],
      required: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    profitPercentage: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    distancesAndDurations: {
      type: Map,
      of: distancesAndDurationsSchema,
      required: true,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Products', productsSchema);
