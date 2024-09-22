const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citiesSchema = new Schema(
  {
    name: {
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
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Cities', citiesSchema);
