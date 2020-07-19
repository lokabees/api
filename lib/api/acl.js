"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = require("lodash");

var _acl = _interopRequireDefault(require("./message/acl"));

var _acl2 = _interopRequireDefault(require("./auth/acl"));

var _acl3 = _interopRequireDefault(require("./user/acl"));

var _acl4 = _interopRequireDefault(require("./verification/acl"));

var _acl5 = _interopRequireDefault(require("./password-reset/acl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* ENDPOINT_ACL_IMPORT */
const defaultPermissions = [];
const permissions = { ...(0, _lodash.groupBy)([
  /* ENDPOINT_ACL_EXPORT */
  ...defaultPermissions, ..._acl.default, ..._acl2.default, ..._acl3.default, ..._acl4.default, ..._acl5.default], 'group')
};
Object.keys(permissions).forEach(group => {
  permissions[group] = permissions[group].reduce((accu, curr) => {
    return {
      group,
      permissions: accu.permissions.concat(curr.permissions)
    };
  });
});

var _default = Object.values(permissions);

exports.default = _default;