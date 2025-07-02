const CORS_OPTIONS = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "lang",
    "Origin",
    "X-Requested-With",
    "Accept",
    "Accept-Language",
    "Cache-Control",
    "ngrok-skip-browser-warning",
  ],
};

module.exports = {
  CORS_OPTIONS,
};
