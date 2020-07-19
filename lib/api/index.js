"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Models = void 0;

var _express = require("express");

var _config = require("../config");

var _guard = require("../services/auth/guard");

var _auth = _interopRequireDefault(require("./auth"));

var _verification = _interopRequireDefault(require("./verification"));

var _passwordReset = _interopRequireDefault(require("./password-reset"));

var _user = _interopRequireWildcard(require("./user"));

var _message = _interopRequireWildcard(require("./message"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* ENDPOINT_ROUTER_IMPORT */
const router = new _express.Router();
/* ENDPOINT_ROUTER_EXPORT */

router.use('/auth', _auth.default);
router.use('/verification', _verification.default);
router.use('/users', _user.default);
router.use('/messages', _message.default);
router.use('/password-reset', _passwordReset.default); // Export the relevant models for swagger documentation

const Models = [
/* ENDPOINT_DOCS_EXPORT */
_user.User, _message.Message]; // Export router for Express Server

exports.Models = Models;
var _default = router;
exports.default = _default;