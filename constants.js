const DraftsStatuses = ['pending', 'error', 'failed', 'completed', 'resolved'];

const ProductsStatuses = ['published', 'draft'];

const BOOKING_STATUSES = {
  pending: {value: 'pending'},
  failed: {value: 'failed'},
  completed: {value: 'completed'},
  error: {value: 'error'},
  resolved: {value: 'resolved'},
};

const POSTHOG_EVENT = {
  success: {
    value: 'success',
    trip_creation: 'trip_creation',
    booking_completed: 'booking_completed',
  },
  error: {value: 'error'},
  info: {
    value: 'info',
    start: 'trip_creation_start',
    duration: 'trip_creation_duration',
  },
};

const getPostHogEvent = (path) => {
  const keys = path.split('.'); // Split "info.created" into ["info", "created"]
  let event = POSTHOG_EVENT;

  for (const key of keys) {
    if (!event[key]) return undefined; // Return undefined if key doesn't exist
    event = event[key];
  }

  return typeof event === 'string' && keys.length > 1
    ? `${POSTHOG_EVENT[keys[0]].value}_${event}` // Append label (e.g., "info_created")
    : event.value || event; // Return value
};

const getPostHogEventWithParams = (eventCategory, subCategory = '') => {
  const eventKey = getPostHogEvent(eventCategory);
  return subCategory ? `${eventKey}_${subCategory.toLowerCase()}` : eventKey;
};

const EVENT_STATUS = {
  initialize: {value: 'initialize'},
  success: {value: 'success'},
  error: {value: 'error'},
};

const FLAG_TYPES = {
  tag: {value: 'tag', name: 'Tag'},
  geoGraphicRegion: {value: 'geoGraphicRegion', name: 'Geo-Graphic Region'},
  theme: {value: 'theme', name: 'Theme'},
};

const FLAG_TYPES_ARR = Object.keys(FLAG_TYPES).map((type) => ({
  name: FLAG_TYPES[type].name,
  value: FLAG_TYPES[type].value,
}));

const FLAG_TYPES_KEYS_ARR = Object.keys(FLAG_TYPES);

module.exports = {
  DraftsStatuses,
  ProductsStatuses,
  BOOKING_STATUSES,
  POSTHOG_EVENT,
  EVENT_STATUS,
  FLAG_TYPES,
  FLAG_TYPES_ARR,
  FLAG_TYPES_KEYS_ARR,
  getPostHogEvent,
  getPostHogEventWithParams,
};
