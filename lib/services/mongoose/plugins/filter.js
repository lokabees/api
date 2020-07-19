"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = select;

/**
 * This plugin adds a filter method to your mongoose schema.
 * it filters the document properties depending on the users role and the method (GET, POST, PUT, DELETE)
 * Usage: document.filter({ role, method })
 * role is optional and defaults to 'guest'
 * method is required
 * @export mongoose select method
 * @param {*} schema, the mongoose schema
 * @param {*} { rules }, ACL rules
 */
function select(schema, _ref) {
  let {
    rules
  } = _ref;

  schema.methods.filter = function (_ref2) {
    var _rules$find, _permissions$find$vie;

    let {
      role = 'guest',
      method
    } = _ref2;
    const {
      permissions
    } = (_rules$find = rules.find(p => p.group === role)) !== null && _rules$find !== void 0 ? _rules$find : [];
    const view = (_permissions$find$vie = permissions.find(rule => rule.methods.includes(method)).view) !== null && _permissions$find$vie !== void 0 ? _permissions$find$vie : [];
    const obj = view.reduce((a, b) => (a[b] = this[b], a), {});
    return obj;
  };
}