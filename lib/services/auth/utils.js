"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.comparePassword = exports.hashPassword = exports.validateUserBeforeCreate = exports.extractMaster = exports.extractToken = void 0;

var _argon = require("argon2");

/**
 * Extract the given token from Header, Query or Body
 * @param {object} req - Incoming Request
 * @returns {string} The token.
 */
const extractToken = req => {
  var _req$headers, _req$headers$authoriz, _req$query, _req$body;

  // Extract JWT from Header
  if (((_req$headers = req.headers) === null || _req$headers === void 0 ? void 0 : (_req$headers$authoriz = _req$headers.authorization) === null || _req$headers$authoriz === void 0 ? void 0 : _req$headers$authoriz.split(' ')[0]) === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } // Extract JWT from Query


  if ((_req$query = req.query) === null || _req$query === void 0 ? void 0 : _req$query.token) {
    return req.query.token;
  } // Extract JWT from Body


  if ((_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.token) {
    return req.body.token;
  }

  return null;
};

exports.extractToken = extractToken;

const extractMaster = req => {
  var _req$headers2, _req$headers2$authori, _req$query2, _req$body2;

  // Extract JWT from Header
  if (((_req$headers2 = req.headers) === null || _req$headers2 === void 0 ? void 0 : (_req$headers2$authori = _req$headers2.authorization) === null || _req$headers2$authori === void 0 ? void 0 : _req$headers2$authori.split(' ')[0]) === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } // Extract JWT from Query


  if ((_req$query2 = req.query) === null || _req$query2 === void 0 ? void 0 : _req$query2.master) {
    return req.query.master;
  } // Extract JWT from Body


  if ((_req$body2 = req.body) === null || _req$body2 === void 0 ? void 0 : _req$body2.master) {
    return req.body.master;
  }

  return null;
};
/**
 * Validate Middleware - cannot create user with another roles
 */


exports.extractMaster = extractMaster;

const validateUserBeforeCreate = () => (_ref, res, next) => {
  let {
    body
  } = _ref;
  return (body === null || body === void 0 ? void 0 : body.role) ? res.status(401).end() : next();
};
/**
 * Hash the Password with argon2
 * @param {string} password
 * @returns {Promise} The hashed password.
 */


exports.validateUserBeforeCreate = validateUserBeforeCreate;

const hashPassword = async password => await (0, _argon.hash)(password);
/**
 * Compare the argon2 password
 * @param {string} password
 * @returns {Promise} The boolean compared return
 */


exports.hashPassword = hashPassword;

const comparePassword = async (password, comparePassword) => await (0, _argon.verify)(password, comparePassword);

exports.comparePassword = comparePassword;