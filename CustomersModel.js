const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customersSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Customers', customersSchema);
