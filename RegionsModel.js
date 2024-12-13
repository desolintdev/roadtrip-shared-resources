const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regionsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    cities: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Cities',
    },
    type: {
      type: String,
      default: 'region',
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Regions', regionsSchema);
