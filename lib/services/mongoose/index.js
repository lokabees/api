"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "paginate", {
  enumerable: true,
  get: function () {
    return _paginate2.default;
  }
});
Object.defineProperty(exports, "gravatar", {
  enumerable: true,
  get: function () {
    return _gravatar2.default;
  }
});
Object.defineProperty(exports, "filter", {
  enumerable: true,
  get: function () {
    return _filter2.default;
  }
});
Object.defineProperty(exports, "ownership", {
  enumerable: true,
  get: function () {
    return _ownership2.default;
  }
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _config = require("../../config");

var _paginate2 = _interopRequireDefault(require("./plugins/paginate"));

var _gravatar2 = _interopRequireDefault(require("./plugins/gravatar"));

var _filter2 = _interopRequireDefault(require("./plugins/filter"));

var _ownership2 = _interopRequireDefault(require("./plugins/ownership"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const processMode = process.env.NODE_ENV;
Object.keys(_config.mongo.options).forEach(key => {
  _mongoose.default.set(key, _config.mongo.options[key]);
});
/* istanbul ignore next */

_mongoose.default.connection.on('error', err => {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

_mongoose.default.connection.on('open', () => {
  console.info('\x1b[36m%s\x1b[0m', 'Mongoose:\x1b[0m Connected');
});

if (processMode !== 'test') {
  _mongoose.default.connect(_config.mongo.uri);
}

var _default = _mongoose.default;
exports.default = _default;