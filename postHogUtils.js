const {PostHog} = require('posthog-node');
const {POSTHOG_EVENT} = require('./constants');

const postHogClient = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST,
});

// Road trip created event
const tripCreationStartedEvent = ({
  distinctId,
  bookingId,
  draftId,
  productTitle,
}) =>
  postHogClient.capture({
    distinctId,
    event: POSTHOG_EVENT.road_trip_creation_started.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
    },
  });

// Road trip successfully completed event
const tripCreationSuccessEvent = ({
  distinctId,
  bookingId,
  draftId,
  productTitle,
}) =>
  postHogClient.capture({
    distinctId,
    event: POSTHOG_EVENT.road_trip_creation_success.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
    },
  });

// Road trip creation failed event
const tripCreationFailedEvent = ({
  distinctId,
  bookingId,
  draftId,
  productTitle,
  city,
  checkInMonth,
  errorCode,
}) =>
  postHogClient.capture({
    distinctId,
    event: POSTHOG_EVENT.road_trip_creation_failed.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
      city,
      check_in_month: checkInMonth,
      error_code: errorCode,
    },
  });

// Time consumed for creating a road trip
const tripCreationDurationEvent = ({
  distinctId,
  bookingId,
  draftId,
  productTitle,
  durationSeconds,
}) =>
  postHogClient.capture({
    distinctId,
    event: POSTHOG_EVENT.road_trip_creation_duration.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
      duration_seconds: durationSeconds,
    },
  });

module.exports = {
  tripCreationStartedEvent,
  tripCreationSuccessEvent,
  tripCreationFailedEvent,
  tripCreationDurationEvent,
};
