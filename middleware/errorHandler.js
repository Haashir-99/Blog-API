const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.log(err);

  console.log(err.statusCode, " ", err.message); // log the error message
  if (!err.data) {
    return res.status(statusCode).json({ message: err.message });
  }
  console.log(err.data); // log error data

  if (Array.isArray(err.data)) {
    const errorsList = [];
    for (const error of err.data) {
      errorsList.push({ message: error.msg, location: error.location });
    }
    return res
      .status(statusCode)
      .json({ message: err.message, errors: errorsList });
  }

  res.status(statusCode).json({ message: err.message, data: err.data });
};

module.exports = errorHandler;
