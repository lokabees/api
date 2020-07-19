"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _bodymen = require("bodymen");

var _controller = require("./controller");

var _auth = require("../../services/auth");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authenticate a user
 */
const router = new _express.Router();
/**
 * @swagger
 * path:
 *  /api/auth/:
 *    post:
 *      summary: Login
 *      tags: [Authentication]
 *      security:
 *        - masterKey: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                password:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  role:
 *                    type: string
 *                  token:
 *                    type: string
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey
 *        "403":
 *          description: Missing permissions (user or password wrong or user is not verified)
 *        "500":
 *          description: Oh boi
 */

router.post('', (0, _auth.masterman)(), (0, _bodymen.middleware)({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}), _controller.authenticate);
/**
 * @swagger
 * path:
 *  /api/auth/logout:
 *    post:
 *      summary: Logout the current session
 *      tags: [Authentication]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "204":
 *          description: Success
 *        "400":
 *          description: Token missing
 *        "500":
 *          description: Oh boi
 */

router.post('/logout', _controller.logout);
/**
 * @swagger
 * path:
 *  /api/auth/logout/all:
 *    post:
 *      summary: Logout all sessions which are associated with the user
 *      tags: [Authentication]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "204":
 *          description: Success
 *        "400":
 *          description: Token missing
 *        "500":
 *          description: Oh boi
 */

router.post('/logout/all', _controller.logoutAll);
/**
 * @swagger
 * path:
 *  /api/auth/{provider}:
 *    post:
 *      summary: Login with 3rd party
 *      tags: [Authentication]
 *      parameters:
 *        - in: path
 *          name: provider
 *          schema:
 *            type: string
 *            enum: [facebook, google]
 *          required: true
 *          description: 3rd party provider name
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  role:
 *                    type: string
 *                  token:
 *                    type: string
 *        "400":
 *          description: Invalid Body
 *        "401":
 *          description: Missing masterkey
 *        "403":
 *          description: Missing permissions (user or password wrong or user is not verified)
 *        "500":
 *          description: Oh boi
 */

router.post('/:provider', (0, _bodymen.middleware)({
  token: {
    type: String,
    required: true
  }
}), _controller.providerAuthenticate);
var _default = router;
exports.default = _default;