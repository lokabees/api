"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _swaggerJsdoc = _interopRequireDefault(require("swagger-jsdoc"));

var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));

var _config = require("../../config");

var _api = require("../../api");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const specs = (0, _swaggerJsdoc.default)(_config.swagger);
const router = new _express.Router();
specs.components.schemas = {};

_api.Models.forEach(model => {
  specs.components.schemas[model.swaggerSchema.title] = model.swaggerSchema;
});

router.use(_config.swagger.url, _swaggerUiExpress.default.serve);
router.get(_config.swagger.url, _swaggerUiExpress.default.setup(specs, {
  explorer: true
}));
var _default = router;
exports.default = _default;