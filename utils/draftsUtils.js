const {BOOKING_STATUSES} = require('../../../constants/bookingConstants');
const {EVENT_STATUS} = require('../constants');
const {
  tripCreationSuccessEvent,
  tripCreationDurationEvent,
} = require('./postHogUtils');

// Extracts key parameters from the draft document for event processing
function getDraftParams({draftDocument}) {
  const stopsCheckInDates = {};
  let stopsHavingHotels = 0;
  let fullyBookedStops = 0;

  // Extract essential details from the draft document
  const {internalBookingId, productId, timers, _id, stops} = draftDocument;
  const allStops = stops.toJSON();

  const totalStops = Object.keys(allStops).length;

  // Parse stops from the draft document and calculate the total count
  for (const [stopKey, stopData] of Object.entries(allStops)) {
    if (stopData?.checkIn) {
      stopsCheckInDates[stopKey] = new Date(stopData.checkIn).toLocaleString(
        'en-US',
        {month: 'long'}
      );
    }

    // Count stops that have a hotel assigned
    if (stopData?.hotel?.providerAmount) totalResponses++;

    // Count successfully booked stops
    if (stopData?.hotel?.bookingStatus === BOOKING_STATUSES.completed.value) {
      fullyBookedStops++;
    }
  }

  return {
    bookingId: internalBookingId || null,
    productTitle: productId?.title || null,
    tripCreationStartTime: timers?.creationStartTime || null,
    draftId: _id || null,
    allResponsesReceived: stopsHavingHotels === totalStops,
    stopsCheckInDates,
    isBookingFullyCompleted: fullyBookedStops === totalStops, // Returns true if all stops are successfully booked
  };
}

// Prepares details about stop-level events, including errors and check-in information
function prepareStopHotelEvent({updatedFields, draftIsBeingGenerated}) {
  const errorDetails = [];
  let hasError = false;
  let isBookingSuccessful = false;

  for (const [fieldKey, fieldValue] of Object.entries(updatedFields)) {
    // Extract city name from fieldKey (e.g., "stops.Kreisfreie Stadt Berlin.hotel.rooms.0.error")
    const cityMatch = fieldKey.match(/stops\.(.*?)\.hotel/);
    const cityName = cityMatch ? cityMatch[1] : null;

    if (draftIsBeingGenerated) {
      // Case 1: Gathering trip details before pre-booking
      // This stage ensures that all relevant details are fetched.
      if (fieldValue?.error) {
        errorDetails.push({
          city: fieldValue?.stopName || null,
          errorCode: fieldValue.error.code,
        });
        hasError = true;
      }
    } else if (Array.isArray(fieldValue)) {
      // Case 2: Pre-booking validation stage
      // We check if hotel rooms are still available before initiating actual bookings.
      for (const room of fieldValue) {
        if (room?.error) {
          errorDetails.push({
            city: cityName,
            errorCode: room.error,
          });
          hasError = true;
        }
      }
    } else if (fieldKey.includes('.error')) {
      // Case 3: Booking initiation stage
      // If an error occurs at this point, the booking attempt failed.
      errorDetails.push({
        city: cityName,
        errorCode: fieldValue, // Direct error value from "stops.[stopName].hotel.rooms.0.error"
      });
      hasError = true;
    } else if (fieldKey.includes('.bookingStatus')) {
      // Case 4: Final booking confirmation
      // If the booking fails, mark it as an error.
      // If it succeeds, track successful bookings.
      if (fieldValue === 'failed') {
        errorDetails.push({
          city: cityName,
          errorCode: 'booking_failed',
        });
        hasError = true;
      } else if (fieldValue === 'completed') {
        isBookingSuccessful = true;
      }
    }
  }

  return {hasError, errorDetails, isBookingSuccessful};
}

// Utility function to calculate and format duration between two timestamps
function calculateDuration(startTime, endTime) {
  const durationInSeconds = parseFloat(
    ((endTime - startTime) / 1000).toFixed(2)
  ); // Convert string back to number
  return durationInSeconds;
}

// Sends success-related events for a trip creation process
function sendCreationSuccessEvents({
  draftDocument,
  tripCreationStartTime,
  bookingId,
  draftId,
  productTitle,
}) {
  const tripCreationEndTime = new Date(); // End time

  // Update the event status to success
  draftDocument.eventStatus = EVENT_STATUS.success.value;
  draftDocument.timers.creationEndTime = tripCreationEndTime;

  // Calculate the duration of trip creation
  const formattedDuration = calculateDuration(
    tripCreationStartTime,
    tripCreationEndTime
  );

  // Trigger event for trip creation duration
  tripCreationDurationEvent({
    bookingId,
    draftId,
    productTitle,
    formattedDuration,
  });

  // Trigger success event for trip creation
  tripCreationSuccessEvent({
    bookingId,
    draftId,
    productTitle,
  });
}

module.exports = {
  getDraftParams,
  prepareStopHotelEvent,
  sendCreationSuccessEvents,
};
