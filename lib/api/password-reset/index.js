"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "PasswordReset", {
  enumerable: true,
  get: function () {
    return _model.default;
  }
});
Object.defineProperty(exports, "schema", {
  enumerable: true,
  get: function () {
    return _model.schema;
  }
});
exports.default = void 0;

var _express = require("express");

var _model = _interopRequireWildcard(require("./model"));

var _auth = require("../../services/auth");

var _bodymen = require("bodymen");

var _model2 = require("../user/model");

var _controller = require("./controller");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * @swagger
 * tags:
 *   name: Password-Reset
 *   description: Reset user password
 */
const router = new _express.Router();
const {
  email,
  password
} = _model2.schema.tree;
/**
 * @swagger
 * path:
 *  /api/password-reset/{token}:
 *    get:
 *      summary: Get information about password reset
 *      tags: [Password-Reset]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Token which got sent by mail
 *      responses:
 *        "200":
 *          description: picture+name from user which requested the password-reset
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                  picture:
 *                    type: string
 *                    format: uri
 *        "404":
 *          description: User or Token not found
 *        "500":
 *          description: Oh boi
 */

router.get('/:token', _controller.show);
/**
 * @swagger
 * path:
 *  /api/password-reset/:
 *    post:
 *      summary: Create a new password-reset thingy
 *      tags: [Password-Reset]
 *      security:
 *        - masterKey: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *      responses:
 *        "204":
 *          description: Password-Reset mail got sent or user does not exist
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey
 *        "500":
 *          description: Oh boi
 */

router.post('', (0, _auth.masterman)(), (0, _bodymen.middleware)({
  email
}), _controller.create);
/**
 * @swagger
 * path:
 *  /api/password-reset/{token}:
 *    put:
 *      summary: Update user password
 *      tags: [Password-Reset]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Password-Reset token
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                password:
 *                  type: string
 *      responses:
 *        "204":
 *          description: Successful update
 *        "400":
 *          description: Password doesn't match the requirements
 *        "403":
 *          description: Missing permissions (User does not exist or is not verified)
 *        "500":
 *          description: Oh boi
 */

router.patch('/:token', (0, _bodymen.middleware)({
  password
}), _controller.update);
var _default = router;
exports.default = _default;