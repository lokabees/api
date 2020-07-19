"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logoutAll = exports.logout = exports.providerAuthenticate = exports.authenticate = void 0;

var _user = require("../user");

var _session = require("../session");

var _auth = require("../../services/auth");

var _httpStatusCodes = require("http-status-codes");

var _utils = require("../../services/auth/utils");

var _response = require("../../services/response");

const signHandler = async (user, res) => {
  // Sign Token
  const {
    _id,
    role,
    token
  } = await (0, _auth.sign)(user);
  res.status(_httpStatusCodes.OK).json({
    _id,
    role,
    token
  });
};

const authenticate = async (_ref, res, next) => {
  let {
    body: {
      email,
      password
    },
    device
  } = _ref;

  // Pass value
  try {
    // Find user
    const user = await _user.User.findOne({
      email
    });

    if (!user) {
      // We do not want to tell the user that the email doesnt exist...
      res.status(_httpStatusCodes.UNAUTHORIZED).json({
        valid: false,
        message: res.__('wrong-credentials')
      }).end();
      return;
    }

    if (!user.verified) {
      res.status(_httpStatusCodes.UNAUTHORIZED).json({
        valid: false,
        message: res.__('unverified')
      }).end();
      return;
    } // Compare password


    const comparedPassword = await (0, _auth.comparePassword)(user.password, password);

    if (!comparedPassword) {
      res.status(_httpStatusCodes.UNAUTHORIZED).json({
        valid: false,
        message: res.__('wrong-credentials')
      }).end();
      return;
    } // Assign device to user


    user.device = device; // Sign in user

    await signHandler(user, res);
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.authenticate = authenticate;

const providerAuthenticate = async (_ref2, res, next) => {
  let {
    body,
    params
  } = _ref2;
  // Pass values
  const {
    provider
  } = params;
  const {
    token
  } = body;

  try {
    // Get user from external provider
    const providerUser = await _auth.providerAuth[provider](token);
    const user = await _user.User.createFromService(providerUser); // Sign in user

    await signHandler(user, res);
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.providerAuthenticate = providerAuthenticate;

const logout = async (req, res, next) => {
  try {
    if ((0, _utils.extractToken)(req) === null) {
      res.status(_httpStatusCodes.BAD_REQUEST).json({
        valid: false,
        message: res.__('missing-token')
      }).end();
      return;
    }

    await (0, _auth.destroy)(req);
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.logout = logout;

const logoutAll = async (req, res, next) => {
  try {
    if ((0, _utils.extractToken)(req) === null) {
      res.status(_httpStatusCodes.BAD_REQUEST).json({
        valid: false,
        message: res.__('missing-token')
      }).end();
      return;
    }

    const {
      user: {
        _id
      }
    } = req;
    await _session.Session.deleteAllUserSessions(_id);
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.logoutAll = logoutAll;