"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressDevice = _interopRequireDefault(require("express-device"));

var _cors = _interopRequireDefault(require("cors"));

var _helmet = _interopRequireDefault(require("helmet"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

var _compression = _interopRequireDefault(require("compression"));

var _morgan = _interopRequireDefault(require("morgan"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _querymen = require("querymen");

var _bodymen = require("bodymen");

var _config = require("../../config");

var _acl = _interopRequireDefault(require("./acl"));

var _swagger = _interopRequireDefault(require("./swagger"));

var _guard = require("../auth/guard");

var _i18n = _interopRequireDefault(require("i18n"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
// istanbul ignore next
const limiter = (0, _expressRateLimit.default)(_config.rateLimiter);

_i18n.default.configure(_config.i18nConfig);

var _default = (apiRoot, routes) => {
  const app = (0, _express.default)();
  /* istanbul ignore next */

  if (_config.env === 'production' || _config.env === 'development') {
    app.use((0, _helmet.default)());
    app.use(limiter);
    app.use((0, _cors.default)());
    app.use((0, _compression.default)());
    app.use((0, _morgan.default)('dev'));
    app.use(_expressDevice.default.capture({
      parseUserAgent: true
    }));
  }

  if (_config.env === 'development') {
    app.use(_swagger.default);
  }

  app.use(_i18n.default.init);
  app.use(_bodyParser.default.urlencoded({
    extended: false
  }));
  app.use(_bodyParser.default.json());
  app.use(_guard.doorman);
  app.use(_acl.default.authorize);
  app.use(apiRoot, routes);
  app.use((0, _querymen.errorHandler)());
  app.use((0, _bodymen.errorHandler)());
  return app;
};

exports.default = _default;