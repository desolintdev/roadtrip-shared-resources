module.exports.DraftsStatuses = [
  'pending',
  'error',
  'failed',
  'completed',
  'resolved',
];

module.exports.ProductsStatuses = ['published', 'draft'];

module.exports.BOOKING_STATUSES = {
  pending: {
    value: 'pending',
  },
  failed: {
    value: 'failed',
  },
  completed: {
    value: 'completed',
  },
  error: {
    value: 'error',
  },
  resolved: {
    value: 'resolved',
  },
};

module.exports.POSTHOG_EVENT = {
  road_trip_creation_started: {
    value: 'road_trip_creation_started',
  },
  road_trip_creation_success: {
    value: 'road_trip_creation_success',
  },
  road_trip_creation_failed: {
    value: 'road_trip_creation_failed',
  },
  road_trip_creation_duration: {
    value: 'road_trip_creation_duration',
  },
};

module.exports.EVENT_STATUS = {
  initialize: {
    value: 'initialize',
  },
  success: {
    value: 'success',
  },
  error: {
    value: 'error',
  },
};

module.exports.FLAG_TYPES = {
  tag: {
    value: 'tag',
    name: 'Tag',
  },
  geoGraphicRegion: {
    value: 'geoGraphicRegion',
    name: 'Geo-Graphic Region',
  },
  theme: {
    value: 'theme',
    name: 'Theme',
  },
};

module.exports.FLAG_TYPES_ARR = Object.keys(this.FLAG_TYPES).map((type) => {
  return {name: this.FLAG_TYPES[type].name, value: this.FLAG_TYPES[type].value};
});

module.exports.FLAG_TYPES_KEYS_ARR = Object.keys(this.FLAG_TYPES);
