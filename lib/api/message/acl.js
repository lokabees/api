"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const permissions = [{
  group: 'guest',
  permissions: [{
    resource: 'messages/*',
    methods: ['GET', 'POST'],
    action: 'allow',
    view: ['content', 'author', 'author.name', 'author.email']
  }]
}, {
  group: 'user',
  permissions: [{
    resource: 'messages/*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    action: 'allow',
    view: ['content', 'author', 'author.name', 'author.email']
  }]
}, {
  group: 'admin',
  permissions: [{
    resource: 'messages/*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    action: 'allow',
    view: ['content', 'author', 'author.name', 'author.email']
  }]
}];
var _default = permissions;
exports.default = _default;