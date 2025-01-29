const {DateTime} = require('luxon');
const {BOOKING_FAILED, BOOKING_STATUSES} = require('../constants');

// Extracts key parameters from the draft document for event processing
function getDraftParams({draftDocument, draftIsBeingGenerated}) {
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
      stopsCheckInDates[stopKey] = DateTime.fromISO(stopData.checkIn)
        .setLocale('en')
        .toFormat('LLLL'); // Full month name
    }

    // Count stops that have a hotel assigned
    if (stopData?.hotel?.id) stopsHavingHotels++;

    // Count successfully booked stops
    if (stopData?.hotel?.bookingStatus === BOOKING_STATUSES.completed.value) {
      fullyBookedStops++;
    }
  }

  const isAllResponsesSuccessful = stopsHavingHotels === totalStops;

  const needToRegisterCompleteEvents =
    isAllResponsesSuccessful && draftIsBeingGenerated;

  return {
    bookingId: internalBookingId || null,
    productTitle: productId?.title || null,
    tripCreationStartTime: timers?.creationStartTime || null,
    draftId: _id || null,
    needToRegisterCompleteEvents,
    stopsCheckInDates,
    isBookingFullyCompleted: fullyBookedStops === totalStops, // Returns true if all stops are successfully booked
  };
}

// Prepares details about stop-level events, including errors and check-in information
function evaluateHotelBookingStatus({updatedFields, draftIsBeingGenerated}) {
  let errorDetails = [];
  let hasError = false;
  let isBookingSuccessful = false;
  let hasSpecificError = false;

  for (const [fieldKey, fieldValue] of Object.entries(updatedFields)) {
    // Extract city name from fieldKey (e.g., "stops.Kreisfreie Stadt Berlin.hotel.rooms.0.error")
    const cityMatch = fieldKey.match(/^stops\.([^.]*)/);
    const cityName = cityMatch ? cityMatch[1] : null;

    if (draftIsBeingGenerated) {
      // Case 1: Gathering trip details before pre-booking
      // This stage ensures that all relevant details are fetched.
      if (fieldValue?.error && !hasSpecificError) {
        errorDetails.push({
          city: fieldValue?.stopName || null,
          errorCode: fieldValue.error.code,
        });
        hasError = true;
        hasSpecificError = true;
      }
    } else if (Array.isArray(fieldValue) && !hasSpecificError) {
      // Case 2: Pre-booking validation stage
      // We check if hotel rooms are still available before initiating actual bookings.
      for (const room of fieldValue) {
        if (room?.error) {
          errorDetails.push({
            city: cityName,
            errorCode: room.error,
          });
          hasError = true;
          hasSpecificError = true;
          break;
        }
      }
    } else if (fieldKey.includes('.error') && !hasSpecificError) {
      // Case 3: Booking initiation stage
      // If an error occurs at this point, the booking attempt failed.
      errorDetails.push({
        city: cityName,
        errorCode: fieldValue, // Direct error value from "stops.[stopName].hotel.rooms.0.error"
      });
      hasError = true;
      hasSpecificError = true;
    } else if (fieldKey.includes('.bookingStatus')) {
      // Case 4: Final booking confirmation
      // If the booking fails, mark it as an error.
      // If it succeeds, track successful bookings.
      if (fieldValue === BOOKING_STATUSES.failed.value) {
        errorDetails.push({
          city: cityName,
          errorCode: BOOKING_FAILED,
        });
        hasError = true;
      } else if (fieldValue === BOOKING_STATUSES.completed.value) {
        isBookingSuccessful = true;
      }
    }
  }

  // Post-processing: Remove "booking_failed" if there's another specific error
  if (hasSpecificError) {
    errorDetails = errorDetails.filter(
      (error) => error.errorCode !== BOOKING_FAILED
    );
  }

  return {hasError, errorDetails, isBookingSuccessful};
}

// Utility function to calculate and format duration between two timestamps
function calculateDuration({startTime}) {
  const endTime = DateTime.now().toJSDate(); // End time

  const formattedDuration = parseFloat(
    ((endTime - startTime) / 1000).toFixed(2)
  ); // Convert string back to number

  return {formattedDuration, endTime};
}

module.exports = {
  getDraftParams,
  evaluateHotelBookingStatus,
  calculateDuration,
};
