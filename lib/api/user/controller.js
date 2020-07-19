"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.destroy = exports.updatePassword = exports.update = exports.create = exports.show = exports.index = void 0;

var _ = require(".");

var _httpStatusCodes = require("http-status-codes");

var _sendgrid = require("../../services/sendgrid");

var _verification = require("../verification");

var _response = require("../../services/response");

const index = async (_ref, res, next) => {
  let {
    querymen,
    user,
    method
  } = _ref;

  try {
    const users = await _.User.paginate(querymen, {
      method,
      user,
      filter: true
    });
    res.status(_httpStatusCodes.OK).json(users);
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.index = index;

const show = async (_ref2, res) => {
  let {
    user: {
      _id,
      role
    },
    method,
    params: {
      id
    }
  } = _ref2;

  try {
    const user = await _.User.findById(id === 'me' ? _id : id);

    if (!user) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      });
      return;
    }

    res.status(_httpStatusCodes.OK).json(user.filter({
      role,
      method
    }));
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

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
    if ((await _.User.findOne({
      email: body.email
    })) !== null) {
      res.status(_httpStatusCodes.CONFLICT).json({
        valid: false,
        message: res.__('email-conflict')
      });
      return;
    }

    const doc = await _.User.create(body);
    const {
      token
    } = await _verification.Verification.create({
      user: doc._id
    });
    await (0, _sendgrid.sendVerificationMail)({
      to: body.email,
      name: body.name,
      token
    });
    res.status(_httpStatusCodes.CREATED).json(doc.filter({
      role: user === null || user === void 0 ? void 0 : user.role,
      method
    }));
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.create = create;

const update = async (_ref4, res, next) => {
  let {
    bodymen: {
      body
    },
    params,
    user,
    method
  } = _ref4;

  try {
    const doc = await _.User.findById(params.id);

    if (!doc) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      });
      return;
    }

    if (!_.User.isOwner(doc, user)) {
      res.status(_httpStatusCodes.FORBIDDEN).json({
        valid: false,
        message: res.__('missing-permission')
      });
      return;
    }

    await doc.set(body).save();
    res.status(_httpStatusCodes.OK).json(doc.filter({
      role: user.role,
      method
    }));
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.update = update;

const updatePassword = async (_ref5, res, next) => {
  let {
    bodymen: {
      body
    },
    params,
    user
  } = _ref5;

  try {
    const doc = await _.User.findById(params.id);

    if (!doc) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      });
      return;
    }

    if (!_.User.isOwner(doc, user)) {
      res.status(_httpStatusCodes.FORBIDDEN).json({
        valid: false,
        message: res.__('missing-permission')
      });
      return;
    }

    await doc.set(body).save();
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.updatePassword = updatePassword;

const destroy = async (_ref6, res, next) => {
  let {
    user,
    params: {
      id
    }
  } = _ref6;

  try {
    const doc = await _.User.findById(id);

    if (!doc) {
      res.status(_httpStatusCodes.NOT_FOUND).json({
        valid: false,
        message: res.__('not-found')
      });
      return;
    }

    if (!_.User.isOwner(doc, user)) {
      res.status(_httpStatusCodes.FORBIDDEN).json({
        valid: false,
        message: res.__('missing-permission')
      });
      return;
    }

    await _.User.deleteOne({
      _id: id
    });
    res.status(_httpStatusCodes.NO_CONTENT).end();
  } catch (error) {
    (0, _response.errorHandler)(res, error);
  }
};

exports.destroy = destroy;