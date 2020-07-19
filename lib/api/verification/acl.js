"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const permissions = [{
  group: 'guest',
  permissions: [{
    resource: 'verification/:token',
    methods: ['GET'],
    action: 'allow'
  }]
}];
var _default = permissions;
exports.default = _default;