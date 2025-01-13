const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for ports
const portSchema = new Schema({
  _id: false,
  name: {type: String, required: true},
  code: {type: String, required: true},
  address: {type: String, required: true},
  latitude: {type: Number, required: true},
  longitude: {type: Number, required: true},
});

// Schema for operator
const operatorSchema = new Schema({
  _id: false,
  id: {type: Number, required: true},
  name: {type: String, required: true},
});

// Main ferry schema
const ferrySchema = new Schema(
  {
    routeId: {type: Number, required: true, unique: true},
    routeName: {type: String, required: true},
    hasVehicle: {type: Boolean, required: true},
    portFrom: {type: portSchema, required: true},
    portTo: {type: portSchema, required: true},
    operatorDetails: {type: operatorSchema, required: true},
    allowPets: {type: Boolean, default: false},
    type: {type: String, default: 'ferry'},
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Ferry', ferrySchema);
