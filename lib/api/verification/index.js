"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Verification", {
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

var _controller = require("./controller");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const router = new _express.Router();
const {
  token
} = _model.schema.tree;
/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: Verify a user
 */

/**
 * @swagger
 * path:
 *  /api/verification/{token}:
 *    get:
 *      summary: Verify user
 *      tags: [Verification]
 *      parameters:
 *        - in: path
 *          name: token
 *          schema:
 *            type: string
 *          required: true
 *          description: Token which got sent per mail
 *      responses:
 *        "204":
 *          description: Success
 *        "404":
 *          description: User or Token not found
 *        "500":
 *          description: Oh boi
 */

router.get('/:token', _controller.verify);
var _default = router;
exports.default = _default;