"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.schema = void 0;

var _mongooseToSwagger = _interopRequireDefault(require("mongoose-to-swagger"));

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongooseKeywords = _interopRequireDefault(require("mongoose-keywords"));

var _randToken = _interopRequireWildcard(require("rand-token"));

var _mongoose2 = require("../../services/mongoose");

var _auth = require("../../services/auth");

var _config = require("../../config");

var _acl = _interopRequireDefault(require("./acl"));

var _validator = require("../../utils/validator");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const roles = ['guest', 'user', 'admin'];
const userSchema = new _mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: _validator.emailValidator
  },
  password: {
    type: String,
    match: _validator.passwordValidator,
    required: true
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  services: {
    facebook: String,
    github: String,
    google: String
  },
  role: {
    type: String,
    enum: roles,
    default: 'user'
  },
  picture: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await (0, _auth.hashPassword)(this.password);
  return next();
});
userSchema.statics = {
  roles,

  async createFromService(_ref) {
    let {
      service,
      id,
      email,
      name,
      picture
    } = _ref;
    const user = await this.findOne({
      $or: [{
        [`services.${service}`]: id
      }, {
        email
      }]
    });

    if (user) {
      user.services[service] = id;
      user.name = name;
      user.picture = picture;
      user.verified = true;
      return user.save();
    } else {
      const password = _randToken.default.generate(32, 'aA1!&bB2§/cC3$(dD4%)');

      const newUser = this.create({
        services: {
          [service]: id
        },
        email,
        password,
        name,
        picture,
        verified: true
      });
      return newUser;
    }
  }

};
userSchema.plugin(_mongoose2.ownership, {
  custom: (doc, user) => user.role === 'admin' || doc._id.toString() === user._id
});
userSchema.plugin(_mongoose2.gravatar);
userSchema.plugin(_mongoose2.paginate, {
  rules: _acl.default,
  populateRules: {
    user: _acl.default
  }
});
userSchema.plugin(_mongooseKeywords.default, {
  paths: ['email', 'name']
});
userSchema.plugin(_mongoose2.filter, {
  rules: _acl.default
});

const model = _mongoose.default.model('User', userSchema);

model.swaggerSchema = (0, _mongooseToSwagger.default)(model);
const schema = model.schema;
exports.schema = schema;
var _default = model;
exports.default = _default;