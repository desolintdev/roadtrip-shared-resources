const mongoose = require('mongoose');
const {DraftsStatuses, BOOKING_STATUSES, EVENT_STATUS} = require('./constants');
const Schema = mongoose.Schema;
const axios = require('axios');
const config = require('config');
const {
  tripCreationStartedEvent,
  tripCreationSuccessEvent,
  tripCreationFailedEvent,
  tripCreationDurationEvent,
} = require('./postHogUtils');

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
      ref: 'Products',
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
    transactionId: {
      type: String,
    },
    tripCreationStartTime: {
      type: Date,
    },
    eventStatus: {
      type: String,
      default: EVENT_STATUS.initialize.value,
    },
  },
  {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}}
);

async function updateBookingStatus({doc, newStatus}) {
  try {
    let path =
      newStatus == BOOKING_STATUSES.failed.value ? 'failed' : 'success';

    doc.bookingStatus = newStatus;

    await doc.save();

    await axios.get(
      `${config.get('processBackendURL')}/bookings/notify/${path}/${doc._id}`
    );
  } catch (error) {}
}

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

  if (
    stopBookingStatusUpdatedTo === BOOKING_STATUSES.failed.value &&
    doc.bookingStatus !== BOOKING_STATUSES.failed.value
  ) {
    await updateBookingStatus({
      doc,
      newStatus: BOOKING_STATUSES.failed.value,
    });
  }

  const {stops: stopsObj} = doc;

  const stops = stopsObj.toJSON();

  if (stopBookingStatusUpdatedTo === BOOKING_STATUSES.completed.value) {
    let completed = 0;

    for (let stop in stops) {
      if (
        stops[stop].hotel.bookingStatus === BOOKING_STATUSES.completed.value
      ) {
        completed += 1;
      }
    }

    if (completed === Object.keys(stops).length) {
      await updateBookingStatus({
        doc,
        newStatus: BOOKING_STATUSES.completed.value,
      });
    }
  }

  let noOfResponsesArrived = 0;

  let noOfErrors = 0;

  for (let stop in stops) {
    if (stops[stop]?.hotel?.providerAmount) noOfResponsesArrived += 1;
    if (stops[stop]?.error) noOfErrors += 1;
  }

  if (noOfResponsesArrived === Object.keys(stops).length) {
    const roundedDiscountAmount = Math.floor(doc.discountAmount);
    doc.discountAmount = roundedDiscountAmount;
    doc.finalAmount = doc.beforeDiscountAmount - roundedDiscountAmount;

    await doc.save();
  }

  doc.status = noOfErrors > 0 ? BOOKING_STATUSES.error.value : doc.status;
  await doc.save();

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

function populateMiddlewareFn(next) {
  this.populate(['productId']);
  next();
}

draftsSchema.pre('save', populateMiddlewareFn);
draftsSchema.pre('findOneAndUpdate', populateMiddlewareFn);

async function handleEventAfterCreate(doc, next) {
  if (!doc?.tripCreationStartTime) {
    const internalBookingId = doc?.internalBookingId || null;
    const productTitle = doc?.productId?.title || null;
    const draftId = doc?._id;
    doc.tripCreationStartTime = doc?.createdAt;

    tripCreationStartedEvent({
      distinctId: internalBookingId,
      bookingId: internalBookingId,
      draftId,
      productTitle,
    });

    await doc.save();
  }

  next();
}

draftsSchema.post('save', handleEventAfterCreate);

function preparedEventData({updatedFields}) {
  let cityName = null;
  let errorCode = null;
  let checkInMonth = null;

  for (const field in updatedFields) {
    if (updatedFields[field]?.stopName)
      cityName = updatedFields[field]?.stopName;
    if (updatedFields[field]?.error)
      errorCode = updatedFields[field]?.error?.code;
    if (updatedFields[field]?.checkIn) {
      const date = new Date(updatedFields[field]?.checkIn);
      checkInMonth = date.toLocaleString('en-US', {month: 'long'});
    }
  }

  return {
    cityName,
    errorCode,
    checkInMonth,
  };
}

async function handleEventAfterUpdate(doc, next) {
  let totalResponses = 0;
  const updateDetails = this.getUpdate();

  if (doc?.eventStatus === EVENT_STATUS.initialize.value) {
    const internalBookingId = doc?.internalBookingId || null;
    const productTitle = doc?.productId?.title || null;
    const tripCreationStartTime = doc?.tripCreationStartTime || null;
    const draftId = doc?._id || null;

    const updatedFields = updateDetails.$set || {};

    const {cityName, errorCode, checkInMonth} = preparedEventData({
      updatedFields,
    });
    const {stops: stopsObject} = doc;
    const stops = stopsObject.toJSON();

    if (errorCode) {
      tripCreationFailedEvent({
        distinctId: internalBookingId,
        bookingId: internalBookingId,
        draftId,
        productTitle,
        city: cityName,
        checkInMonth,
        errorCode,
      });
      doc.eventStatus = EVENT_STATUS.error.value;
    }

    for (const stop in stops) {
      if (stops[stop]?.hotel?.providerAmount) totalResponses += 1;
    }

    const totalStops = Object.keys(stops).length;

    if (totalResponses === totalStops) {
      doc.eventStatus = EVENT_STATUS.success.value;
      const tripCreationEndTime = new Date(); // End time

      const differenceInSeconds =
        (tripCreationEndTime - tripCreationStartTime) / 1000; // Difference in milliseconds to seconds

      const duration =
        differenceInSeconds >= 60
          ? `${(differenceInSeconds / 60).toFixed(2)} minutes`
          : `${differenceInSeconds.toFixed(2)} seconds`;

      tripCreationDurationEvent({
        distinctId: internalBookingId,
        bookingId: internalBookingId,
        draftId,
        productTitle,
        durationSeconds: duration,
      });

      tripCreationSuccessEvent({
        distinctId: internalBookingId,
        bookingId: internalBookingId,
        draftId,
        productTitle,
      });
    }

    await doc.save();
  }

  next();
}

draftsSchema.post('findOneAndUpdate', handleEventAfterUpdate);

module.exports = mongoose.model('Drafts', draftsSchema);
