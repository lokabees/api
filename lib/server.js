"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = require("./config");

require("./services/mongoose");

var _express = _interopRequireDefault(require("./services/express"));

var _api = _interopRequireDefault(require("./api/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const processMode = process.env.NODE_ENV;
const app = (0, _express.default)(_config.apiRoot, _api.default);

if (processMode !== 'test') {
  app.listen(_config.port, () => {
    console.info('\x1b[1m', `| Server:\x1b[0m http://${_config.ip}:${_config.port}`);
    console.info('\x1b[1m', `| Api:\x1b[0m http://${_config.ip}:${_config.port}${_config.apiRoot}`);
    console.info('\x1b[1m', `| Docs:\x1b[0m http://${_config.ip}:${_config.port}${_config.swagger.url}`);
  });
}

var _default = app;
exports.default = _default;