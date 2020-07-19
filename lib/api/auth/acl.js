"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const permissions = [{
  group: 'guest',
  permissions: [{
    resource: 'auth/*',
    methods: ['POST'],
    action: 'allow'
  }]
}, {
  group: 'user',
  permissions: [{
    resource: 'auth/*',
    methods: ['POST'],
    action: 'allow'
  }]
}, {
  group: 'admin',
  permissions: [{
    resource: 'auth/*',
    methods: ['POST'],
    action: 'allow'
  }]
}];
var _default = permissions;
exports.default = _default;