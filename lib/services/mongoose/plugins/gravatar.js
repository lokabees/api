"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = gravatar;

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function replace the default userpicture with a gravatar
 * @param {email} email input of user
 */
function gravatar(schema, options) {
  schema.path('email').set(function (email) {
    if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
      const hash = _crypto.default.createHash('md5').update(email).digest('hex');

      this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
    }

    if (!this.name) {
      this.name = email.replace(/^(.+)@.+$/, '$1');
    }

    return email;
  });
}