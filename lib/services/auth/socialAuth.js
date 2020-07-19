"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.providerAuth = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const providerAuth = {
  facebook: async access_token => {
    var _picture$data;

    const {
      id,
      name,
      email,
      picture
    } = await (0, _requestPromise.default)({
      uri: 'https://graph.facebook.com/me',
      json: true,
      qs: {
        access_token,
        fields: 'id, name, email, picture'
      }
    });
    return {
      service: 'facebook',
      picture: picture === null || picture === void 0 ? void 0 : (_picture$data = picture.data) === null || _picture$data === void 0 ? void 0 : _picture$data.url,
      id,
      name,
      email
    };
  },
  google: async access_token => {
    const {
      id,
      name,
      email,
      picture
    } = await (0, _requestPromise.default)({
      uri: 'https://www.googleapis.com/userinfo/v2/me',
      json: true,
      qs: {
        access_token
      }
    });
    return {
      service: 'google',
      picture,
      id,
      name,
      email
    };
  }
};
exports.providerAuth = providerAuth;