"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.destroy = exports.update = exports.create = exports.show = exports.index = void 0;

var _ = require(".");

var _httpStatusCodes = require("http-status-codes");

var _response = require("../../services/response");

// Get all
const index = async (_ref, res, next) => {
  let {
    querymen,
    user,
    method
  } = _ref;

  try {
    const messages = await _.Message.paginate(querymen, {
      populate: [{
        path: 'author'
      }],
      method,
      user
    });
    res.status(_httpStatusCodes.OK).json(messages);
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
}; // Get One


exports.index = index;

const show = async (_ref2, res, next) => {
  let {
    params: {
      id
    },
    method,
    user
  } = _ref2;

  try {
    const message = await _.Message.findById(id).populate('author');

    if (!message) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      }).end();
      return;
    }

    res.status(_httpStatusCodes.OK).json(message.filter({
      role: user === null || user === void 0 ? void 0 : user.role,
      method
    }));
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
}; // Post


exports.show = show;

const create = async (_ref3, res, next) => {
  let {
    bodymen: {
      body
    },
    method,
    user
  } = _ref3;

  try {
    const message = await _.Message.create(body);
    res.status(_httpStatusCodes.CREATED).json(message.filter({
      role: user === null || user === void 0 ? void 0 : user.role,
      method
    }));
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
}; // Put


exports.create = create;

const update = async (_ref4, res, next) => {
  let {
    bodymen: {
      body
    },
    user,
    method,
    params: {
      id
    }
  } = _ref4;

  try {
    const message = await _.Message.findById(id).populate('author');

    if (!message) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      }).end();
      return;
    }

    if (!_.Message.isOwner(message, user)) {
      res.status(_httpStatusCodes.FORBIDDEN).json({
        valid: false,
        message: res.__('missing-permission')
      }).end();
      return;
    }

    await message.set(body).save();
    res.status(_httpStatusCodes.OK).json(message.filter({
      role: user === null || user === void 0 ? void 0 : user.role,
      method
    }));
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
}; // Delete


exports.update = update;

const destroy = async (_ref5, res, next) => {
  let {
    params: {
      id
    },
    user
  } = _ref5;

  try {
    const message = await _.Message.findById(id);

    if (!message) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      }).end();
      return;
    }

    if (!_.Message.isOwner(message, user)) {
      res.status(_httpStatusCodes.FORBIDDEN).json({
        valid: false,
        message: res.__('missing-permission')
      }).end();
      return;
    }

    await message.deleteOne({
      _id: id
    });
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.destroy = destroy;