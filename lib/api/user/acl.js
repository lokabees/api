"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const permissions = [{
  group: 'guest',
  permissions: [{
    resource: 'users/',
    methods: ['POST'],
    action: 'allow',
    view: ['_id', 'verified', 'role', 'picture', 'name', 'email']
  }]
}, {
  group: 'user',
  permissions: [{
    resource: 'users/:id/*',
    methods: ['PUT', 'DELETE', 'GET'],
    checkOwner: true,
    action: 'allow',
    view: ['_id', 'verified', 'role', 'name', 'email', 'picture']
  }]
}, {
  group: 'admin',
  permissions: [{
    resource: 'users/*',
    methods: ['POST', 'DELETE', 'PUT', 'GET'],
    action: 'allow',
    view: ['_id', 'verified', 'role', 'name', 'email', 'picture']
  }]
}];
var _default = permissions;
exports.default = _default;