const mongoose = require('mongoose');
const {ProductsStatuses} = require('./constants');
const Schema = mongoose.Schema;

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
  origin: {
    type: Map,
    required: true,
  },
  destination: {
    type: Map,
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
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Cities',
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
      type: [distancesAndDurationsSchema],
      required: true,
    },
    status: {
      type: String,
      enum: ProductsStatuses,
      default: 'draft',
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Products', productsSchema);
