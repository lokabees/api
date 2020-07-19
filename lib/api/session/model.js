"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.schema = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _config = require("../../config");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const sessionSchema = new _mongoose.Schema({
  jti: {
    type: String,
    required: true,
    minlength: 2
  },
  user: {
    type: 'ObjectId',
    ref: 'User',
    required: false
  },
  device: {
    type: {
      type: String
    },
    name: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: _config.jwtConfig.expiresIn
  }
}); // TODO: work with indices

sessionSchema.statics = {
  deleteAllUserSessions: async function (user) {
    await model.deleteMany({
      user
    });
  }
};

const model = _mongoose.default.model('Session', sessionSchema);

const schema = model.schema;
exports.schema = schema;
var _default = model;
exports.default = _default;