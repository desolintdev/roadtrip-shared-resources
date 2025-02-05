const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stopsSchema = new Schema({
  _id: false,
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Name must be at least 5 characters long'],
    maxlength: [100, 'Name cannot exceed 200 characters'],
  },
  description: {
    type: Map,
  },
  images: {
    type: [String],
  },
});

const guidesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Title must be at least 5 characters long'],
      maxlength: [100, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: Map,
    },
    stops: {
      type: [stopsSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'A guide must have at least one stop',
      },
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

module.exports = mongoose.model('Guides', guidesSchema);
