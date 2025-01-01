const {PostHog} = require('posthog-node');
const {POSTHOG_EVENT} = require('../constants');
const config = require('config');

const postHogClient = new PostHog(config.get('posthogAPIKey'), {
  host: config.get('posthogHost'),
});

// Road trip created event
const tripCreationStartedEvent = ({bookingId, draftId, productTitle}) =>
  postHogClient.capture({
    distinctId: bookingId,
    event: POSTHOG_EVENT.road_trip_creation_started.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
    },
  });

// Road trip successfully completed event
const tripCreationSuccessEvent = ({bookingId, draftId, productTitle}) =>
  postHogClient.capture({
    distinctId: bookingId,
    event: POSTHOG_EVENT.road_trip_creation_success.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
    },
  });

// Road trip creation failed event
const tripCreationFailedEvent = ({
  bookingId,
  draftId,
  productTitle,
  city,
  checkInMonth,
  errorCode,
}) =>
  postHogClient.capture({
    distinctId: bookingId,
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
  bookingId,
  draftId,
  productTitle,
  formattedDuration,
}) =>
  postHogClient.capture({
    distinctId: bookingId,
    event: POSTHOG_EVENT.road_trip_creation_duration.value,
    properties: {
      booking_id: bookingId,
      draft_id: draftId,
      product_title: productTitle,
      duration_seconds: formattedDuration,
    },
  });

module.exports = {
  tripCreationStartedEvent,
  tripCreationSuccessEvent,
  tripCreationFailedEvent,
  tripCreationDurationEvent,
};
