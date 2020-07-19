"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressAcl = _interopRequireDefault(require("express-acl"));

var _acl = _interopRequireDefault(require("../../api/acl"));

var _config = require("../../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOC: https://github.com/nyambati/express-acl#readme
 */
// acl configuration
_expressAcl.default.config({
  //specify your own baseUrl
  baseUrl: _config.apiRoot.replace(/^\/|\/$/g, ''),
  filename: 'acl.js',
  //path to acl (nacl) file
  rules: _acl.default,
  yml: true,
  // The default role allows you to specify which role users will assume if they are not assigned any
  defaultRole: 'guest',
  roleSearchPath: 'user.role'
});

var _default = _expressAcl.default;
exports.default = _default;