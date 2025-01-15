const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agentsSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    tip: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Agents', agentsSchema);
