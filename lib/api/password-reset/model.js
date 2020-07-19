"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.schema = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _randToken = require("rand-token");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const passwordResetSchema = new _mongoose.Schema({
  user: {
    type: _mongoose.Schema.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => (0, _randToken.uid)(32)
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

const model = _mongoose.default.model('PasswordReset', passwordResetSchema);

const schema = model.schema;
exports.schema = schema;
var _default = model;
exports.default = _default;