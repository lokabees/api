"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = exports.create = exports.show = void 0;

var _ = require(".");

var _httpStatusCodes = require("http-status-codes");

var _user = require("../user");

var _session = require("../session");

var _response = require("../../services/response");

var _sendgrid = require("../../services/sendgrid");

const show = async (_ref, res, next) => {
  let {
    params: {
      token
    }
  } = _ref;

  try {
    const reset = await _.PasswordReset.findOne({
      token
    }).populate('user');

    if (!reset || !reset.user) {
      res.status(_httpStatusCodes.BAD_REQUEST).json({
        valid: false,
        message: res.__('invalid-parameters')
      }).end();
      return;
    }

    const {
      picture,
      name
    } = reset.user;
    res.status(_httpStatusCodes.OK).json({
      picture,
      name
    });
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.show = show;

const create = async (_ref2, res, next) => {
  let {
    bodymen: {
      body: {
        email
      }
    }
  } = _ref2;

  try {
    const user = await _user.User.findOne({
      email
    });

    if (!user) {
      // We don't want to allow user enumeration, thats why we return NO_CONTENT instead of NOT_FOUND.
      // This endpoint should be monitored
      res.status(_httpStatusCodes.NO_CONTENT).end();
      return;
    }

    const reset = await _.PasswordReset.create({
      user: user._id
    });
    const {
      token
    } = reset;
    await (0, _sendgrid.sendPasswordResetMail)({
      to: email,
      name: user.name,
      token
    });
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.create = create;

const update = async (_ref3, res, next) => {
  let {
    bodymen: {
      body: {
        password
      }
    },
    params: {
      token
    }
  } = _ref3;

  try {
    var _await$PasswordReset$;

    const {
      user
    } = (_await$PasswordReset$ = await _.PasswordReset.findOne({
      token
    }).populate('user')) !== null && _await$PasswordReset$ !== void 0 ? _await$PasswordReset$ : {};

    if (!user || !user.verified) {
      // Is 403 the right code? We should also monitor this endpoint closely
      res.status(_httpStatusCodes.FORBIDDEN).json({
        valid: false,
        message: res.__('missing-permission')
      }).end();
      return;
    }

    await user.set({
      password
    }).save();
    await _.PasswordReset.deleteOne({
      user
    });
    await _session.Session.deleteAllUserSessions(user._id);
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.update = update;