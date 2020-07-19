"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorHandler = void 0;

var _httpStatusCodes = require("http-status-codes");

const production = process.env.NODE_ENV === 'production';

const errorHandler = (res, error) => {
  if (production) {// TODO: Implement appropriate logging here
  } else {
    console.error(error);
  }

  res.status(_httpStatusCodes.INTERNAL_SERVER_ERROR).json({
    valid: false,
    message: production ? res.__('error') : error.toString()
  });
};

exports.errorHandler = errorHandler;