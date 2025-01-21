const {EVENT_STATUS} = require('../constants');
const {
  tripCreationSuccessEvent,
  tripCreationDurationEvent,
} = require('./postHogUtils');

// Extracts key parameters from the draft document for event processing
function getDraftParams({draftDocument}) {
  let totalResponses = 0;
  const stopsCheckInDates = {};

  // Extract essential details from the draft document
  const {internalBookingId, productId, timers, _id, stops} = draftDocument;
  const allStops = stops.toJSON();
  // Parse stops from the draft document and calculate the total count
  for (const [stopKey, stopData] of Object.entries(allStops)) {
    if (stopData?.checkIn) {
      stopsCheckInDates[stopKey] = new Date(stopData.checkIn).toLocaleString(
        'en-US',
        {month: 'long'}
      );
    }
    // Count stops that have received provider amount details
    if (stopData?.hotel?.providerAmount) totalResponses++;
  }

  return {
    bookingId: internalBookingId || null,
    productTitle: productId?.title || null,
    tripCreationStartTime: timers?.creationStartTime || null,
    draftId: _id || null,
    allResponsesReceived: totalResponses === Object.keys(allStops).length,
    stopsCheckInDates,
  };
}

// Prepares details about stop-level events, including errors and check-in information
function prepareStopHotelEvent({updatedFields, draftIsBeingGenerated}) {
  let hasError = false;
  const errorDetails = [];

  for (const [fieldKey, fieldValue] of Object.entries(updatedFields)) {
    if (draftIsBeingGenerated) {
      if (fieldValue?.error) {
        errorDetails.push({
          city: fieldValue?.stopName || null,
          errorCode: fieldValue.error.code,
        });
        hasError = true;
      }
    } else if (Array.isArray(fieldValue)) {
      // Collect multiple errors in pre-book stage
      const cityName = fieldKey.split('.')[1]; // Extract city from key
      for (const room of fieldValue) {
        if (room?.error) {
          errorDetails.push({
            city: cityName,
            errorCode: room.error,
          });
          hasError = true;
        }
      }
    }
  }

  return {hasError, errorDetails};
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
