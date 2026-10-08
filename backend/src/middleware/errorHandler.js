export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON format",
    });
  }

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error:
      status >= 500
        ? "Internal server error"
        : "Request could not be processed",
  });
}
