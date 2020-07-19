"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "User", {
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

var _querymen = require("querymen");

var _bodymen = require("bodymen");

var _auth = require("../../services/auth");

var _model = _interopRequireWildcard(require("./model"));

var _controller = require("./controller");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */
const router = new _express.Router();
const {
  email,
  password,
  name,
  picture,
  role
} = _model.schema.tree; // TODO: Pagination docs

/**
 * @swagger
 * path:
 *  /api/users/:
 *    get:
 *      summary: Get users
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "200":
 *          description: A user schema array (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */

router.get('/', (0, _querymen.middleware)(), _controller.index);
/**
 * @swagger
 * path:
 *  /api/users/{userId}:
 *    get:
 *      summary: Get user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to get or 'me' to get the current user
 *      responses:
 *        "200":
 *          description: A user schema (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */

router.get('/:id', _controller.show);
/**
 * @swagger
 * path:
 *  /api/users/:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      security:
 *        - masterKey: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        "201":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */

router.post('/', (0, _auth.masterman)(), (0, _auth.validateUserBeforeCreate)(), (0, _bodymen.middleware)({
  email,
  password,
  name,
  picture,
  role
}), _controller.create);
/**
 * @swagger
 * path:
 *  /api/users/{userId}:
 *    put:
 *      summary: Update user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to update
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                picture:
 *                  type: string
 *                  format: uri
 *      responses:
 *        "200":
 *          description: User schema (fields depend on the ACL)
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */

router.put('/:id', (0, _bodymen.middleware)({
  name,
  picture
}), _controller.update);
/**
 * @swagger
 * path:
 *  /api/users/{userId}/password:
 *    put:
 *      summary: Update user password
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to update
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
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */

router.put('/:id/password', (0, _bodymen.middleware)({
  password
}), _controller.updatePassword);
/**
 * @swagger
 * path:
 *  /api/users/{userId}:
 *    delete:
 *      summary: Delete user
 *      tags: [Users]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the user to delete
 *      responses:
 *        "204":
 *          description: Successfully deleted user
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Oh boi
 */

router.delete('/:id', _controller.destroy);
var _default = router;
exports.default = _default;