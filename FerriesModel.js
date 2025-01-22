const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for ports
const portSchema = new Schema({
  _id: false,
  name: {type: String, required: true},
  code: {type: String, required: true},
  address: {type: String},
  latitude: {type: Number, required: true},
  longitude: {type: Number, required: true},
});

// Schema for Estimated Quotes
const estimatedQuotesSchema = new Schema({
  _id: false,
  isAlternativeRoute: {type: Boolean, default: false},
  selectedCurrency: {type: String, required: true},
  isSpecialOffer: {type: Boolean, default: false},
  isOpenTicket: {type: Boolean, default: false},
  hasTicketTypes: {type: Boolean, default: false},
  hasAccommodations: {type: Boolean, default: false},
  price: {type: Number, default: 0},
  departureTime: {type: String, required: true},
  arrivalTime: {type: String, required: true},
  duration: {type: Number, required: true},
  vehicles: {type: [Map], required: true},
  accommodationMessage: {type: String},
  petInstructions: {type: String},
});

// Schema for operator
const operatorSchema = new Schema({
  _id: false,
  id: {type: Number, required: true},
  name: {type: String, required: true},
  isPreferred: {type: Boolean, default: false},
  estimatedQuotes: {type: [estimatedQuotesSchema], required: true},
});

// Main ferry schema
const ferrySchema = new Schema(
  {
    routeId: {type: Number, required: true, unique: true},
    routeName: {type: String, required: true},
    hasVehicle: {type: Boolean, required: true},
    portFrom: {type: portSchema, required: true},
    portTo: {type: portSchema, required: true},
    operators: {type: [operatorSchema], required: true},
    allowPets: {type: Boolean, default: false},
    petConditions: {type: String},
    type: {type: String, default: 'ferry'},
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Ferry', ferrySchema);
