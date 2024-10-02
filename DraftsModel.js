const mongoose = require('mongoose');
const {DraftsStatuses, BOOKING_STATUSES} = require('./constants');
const Schema = mongoose.Schema;
const axios = require('axios');
const config = require('config');

const draftQuerySchema = new Schema({
  _id: false,
  noOfRooms: {
    type: Number,
    default: 1,
  },
  cancellable: {
    type: Boolean,
    default: false,
  },
  cheapest: {
    type: Boolean,
    default: false,
  },
  noOfDays: {
    type: Map,
  },
});

const draftGuestsSchema = new Schema({
  _id: false,
  adults: {
    type: Number,
    default: 0,
  },
  children: {
    type: Array,
    default: [],
  },
});

const draftsSchema = new Schema(
  {
    internalBookingId: {
      type: Number,
      required: true,
      index: {unique: true},
    },
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    checkIn: {
      type: String,
      required: true,
    },
    checkOut: {
      type: String,
      required: true,
    },
    guests: {
      type: [draftGuestsSchema],
      required: true,
    },
    stops: {
      type: Map,
      required: true,
    },
    query: {
      type: draftQuerySchema,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    profitPercentage: {
      type: Number,
      default: 0,
    },
    providerAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    profitAmount: {
      type: Number,
      default: 0,
    },
    beforeDiscountAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: DraftsStatuses,
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: DraftsStatuses,
      default: 'pending',
    },
    travellers: {
      type: Map,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

draftsSchema.post('findOneAndUpdate', async function (doc, next) {
  const update = this.getUpdate();

  const updatedFields = update.$set || {};

  let stopBookingStatusUpdatedTo = null;

  for (let key in updatedFields) {
    if (key.includes('.bookingStatus')) {
      stopBookingStatusUpdatedTo = updatedFields[key];
      break;
    }
  }

  async function updateBookingStatus(doc, newStatus, notificationPath) {
    doc.bookingStatus = newStatus;
    await doc.save();
    axios.get(
      `${config.get('processBackendURL')}${notificationPath}/${doc._id}`
    );
  }

  if (
    stopBookingStatusUpdatedTo === BOOKING_STATUSES.failed.value &&
    doc.bookingStatus !== BOOKING_STATUSES.failed.value
  ) {
    await updateBookingStatus(
      doc,
      BOOKING_STATUSES.failed.value,
      '/bookings/notify/failed'
    );
  }

  if (stopBookingStatusUpdatedTo === BOOKING_STATUSES.completed.value) {
    const {stops: stopsObj} = doc;

    const stops = stopsObj.toJSON();

    let completed = 0;

    for (let stop in stops) {
      if (
        stops[stop].hotel.bookingStatus === BOOKING_STATUSES.completed.value
      ) {
        completed += 1;
      }
    }

    if (completed === Object.keys(stops).length) {
      await updateBookingStatus(
        doc,
        BOOKING_STATUSES.completed.value,
        '/bookings/notify'
      );
    }
  }

  next();
});

draftsSchema.virtual('cancellationDate').get(function () {
  let cancellationDate = '';
  const stops = this.stops.toJSON();
  for (let stop in stops) {
    if (cancellationDate == '')
      cancellationDate = stops[stop]?.hotel?.cancellationDate;
    else if (
      stops[stop]?.hotel?.cancellationDate === null ||
      stops[stop]?.hotel?.cancellationDate < cancellationDate
    )
      cancellationDate = stops[stop]?.hotel?.cancellationDate;
  }
  return cancellationDate;
});

module.exports = mongoose.model('Drafts', draftsSchema);
