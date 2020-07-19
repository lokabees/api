"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.schema = void 0;

var _mongooseToSwagger = _interopRequireDefault(require("mongoose-to-swagger"));

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongoose2 = require("../../services/mongoose");

var _acl = _interopRequireDefault(require("./acl"));

var _acl2 = _interopRequireDefault(require("../user/acl"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Data schema for message
const dataSchema = new _mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 2
  },
  author: {
    type: 'ObjectId',
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => {
      delete ret._id;
    }
  }
});
dataSchema.plugin(_mongoose2.filter, {
  rules: _acl.default
});
dataSchema.plugin(_mongoose2.paginate, {
  rules: _acl.default,
  populateRules: {
    author: _acl2.default
  }
});
dataSchema.plugin(_mongoose2.ownership);

const model = _mongoose.default.model('Message', dataSchema);

model.swaggerSchema = (0, _mongooseToSwagger.default)(model);
const schema = model.schema;
exports.schema = schema;
var _default = model;
exports.default = _default;