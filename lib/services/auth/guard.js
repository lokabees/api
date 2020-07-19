"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.masterman = exports.doorman = exports.destroy = exports.decodeJWT = exports.sign = exports.roles = exports.verify = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _expressJwt = _interopRequireDefault(require("express-jwt"));

var _session = _interopRequireDefault(require("../../api/session"));

var _randToken = require("rand-token");

var _utils = require("./utils");

var _config = require("../../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Get JWT Secret
const {
  secret
} = _config.jwtConfig;

const verify = async (token, secret) => _jsonwebtoken.default.verify(token, secret);

exports.verify = verify;

const isRevokedCallback = async (req, res, done) => {
  try {
    const {
      jti
    } = await verify((0, _utils.extractToken)(req), secret);
    return done(null, !(await _session.default.exists({
      jti
    })));
  } catch (error) {
    return done(null, true);
  }
}; // Define user roles


const roles = ['guest', 'user', 'admin'];
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwtSessionToken:
 *       type: http
 *       scheme: bearer
 */

exports.roles = roles;

const sign = async (_ref) => {
  let {
    _id,
    role,
    device = {}
  } = _ref;

  try {
    const token = await _jsonwebtoken.default.sign({
      _id,
      role
    }, secret, {
      expiresIn: _config.jwtConfig.expiresIn,
      jwtid: (0, _randToken.uid)(12)
    });
    const tokenInformation = await _jsonwebtoken.default.decode(token);
    await _session.default.create({
      jti: tokenInformation.jti,
      user: _id,
      device
    });
    return Object.assign(tokenInformation, {
      token
    });
  } catch (error) {
    // TODO: error handling (catch and response)
    // TODO: if token expired -> force remove from collection
    console.log(error);
  }
};

exports.sign = sign;

const decodeJWT = async token => _jsonwebtoken.default.decode(token); // Destroy token from index


exports.decodeJWT = decodeJWT;

const destroy = async req => {
  const {
    jti
  } = await _jsonwebtoken.default.decode((0, _utils.extractToken)(req));
  await _session.default.findOneAndRemove({
    jti
  });
}; // Main middleware validator


exports.destroy = destroy;
const doorman = (0, _expressJwt.default)({ ..._config.jwtConfig,
  ...{
    isRevoked: isRevokedCallback
  }
});
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     masterKey:
 *       type: apiKey
 *       in: query
 *       name: master
 */

exports.doorman = doorman;

const masterman = () => (req, res, next) => _config.masterKey === (0, _utils.extractMaster)(req) ? next() : res.status(401).end();

exports.masterman = masterman;