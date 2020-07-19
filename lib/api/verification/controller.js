"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verify = void 0;

var _ = require(".");

var _httpStatusCodes = require("http-status-codes");

var _response = require("../../services/response");

const verify = async (_ref, res, next) => {
  let {
    params: {
      token
    }
  } = _ref;

  try {
    const verification = await _.Verification.findOne({
      token
    }).populate('user');

    if (!verification || !verification.user) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      });
      return;
    }

    await verification.user.set({
      verified: true
    }).save();
    await verification.remove();
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.verify = verify;