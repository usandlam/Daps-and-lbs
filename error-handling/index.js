module.exports = (app) => {
  app.use((req, res, next) => {
    // this middleware runs whenever requested page is not available
    res.status(404).json({ errorMessage: "This route does not exist" });
  });

  app.use((err, req, res, next) => {
    // whenever you call next(err), this middleware will handle the error
    // always logs the error
    console.error("ERROR", req.method, req.path, err);

    if (err && err.status === 401 && err.inner && err.inner.message) {
      if (err.code === "credentials_required") {
        res.status(err.status).json({
          errorMessage: err.inner.message,
        });
      } else {
        res.status(err.status).json({
          errorMessage: err.inner.message,
        });
      }
      return;
    }
    if (err && err.status > 401 && err.status <= 500) {
      res.status(err.status).json({
        errorMessage: err.inner.message,
      });
      return;
    }

    // only render if the error ocurred before sending the response
    if (!res.headersSent) {
      res.status(500).json({
        errorMessage: "Internal server error. Check the server console",
      });
    }
  });
};
