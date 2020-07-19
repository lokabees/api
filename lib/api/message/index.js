"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Message", {
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

var _request = require("../../services/request");

var _controller = require("./controller");

var _model = _interopRequireWildcard(require("./model"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const {
  content
} = _model.schema.tree;
/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management
 */

const router = new _express.Router();
/**
 * @swagger
 * path:
 *  api/messages/:
 *    post:
 *      summary: Create a new Message
 *      tags: [Messages]
 *      security:
 *        - jwtSessionToken: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                content:
 *                  type: string
 *      responses:
 *        "201":
 *          description: A message schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Message'
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */

router.post('/', (0, _bodymen.middleware)({
  content
}), (0, _request.addAuthor)({
  required: false,
  addBody: true
}), _controller.create); // TODO: Pagination docs

/**
 * @swagger
 * path:
 *  api/messages/:
 *    get:
 *      summary: Get messages
 *      tags: [Messages]
 *      security:
 *        - jwtSessionToken: []
 *      responses:
 *        "200":
 *          description: A message schema array (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "500":
 *          description: Oh boi
 */

router.get('/', (0, _querymen.middleware)(), _controller.index);
/**
 * @swagger
 * path:
 *  api/messages/{messageId}:
 *    get:
 *      summary: Get Message
 *      tags: [Messages]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: messageId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the message to get
 *      responses:
 *        "200":
 *          description: A message schema (fields depend on the ACL)
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Message not found
 *        "500":
 *          description: Oh boi
 */

router.get('/:id', _controller.show);
/**
 * @swagger
 * path:
 *  api/messages/{messageId}:
 *    put:
 *      summary: Update message
 *      tags: [Messages]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: messageId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the message to update
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                content:
 *                  type: string
 *      responses:
 *        "200":
 *          description: Message schema (fields depend on the ACL)
 *        "400":
 *          description: Invalid Body
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Message not found
 *        "500":
 *          description: Oh boi
 */

router.put('/:id', (0, _bodymen.middleware)({
  content
}), _controller.update);
/**
 * @swagger
 * path:
 *  api/messages/{messageId}:
 *    delete:
 *      summary: Delete message
 *      tags: [Messages]
 *      security:
 *        - jwtSessionToken: []
 *      parameters:
 *        - in: path
 *          name: messageId
 *          schema:
 *            type: string
 *          required: true
 *          description: ObjectId of the message to delete
 *      responses:
 *        "204":
 *          description: Successfully deleted message
 *        "403":
 *          description: Missing permissions
 *        "404":
 *          description: Message not found
 *        "500":
 *          description: Oh boi
 */

router.delete('/:id', _controller.destroy);
var _default = router;
exports.default = _default;