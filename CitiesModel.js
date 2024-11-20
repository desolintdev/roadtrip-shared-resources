const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const displayNameSchema = new Schema({
  _id: false,
  en: {
    type: String,
  },
  nl: {
    type: String,
  },
});

const citiesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
    },
    address: {
      type: Map,
      required: true,
    },
    postId: {
      type: String,
    },
    hotels: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Hotels',
    },
    remarks: {
      type: String,
    },
    displayName: {
      type: displayNameSchema,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Cities', citiesSchema);
