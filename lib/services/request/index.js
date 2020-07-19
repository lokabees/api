"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addAuthor = void 0;

/**
 * addAuthor is a middleware which takes the _id property from the jwt user and adds it to the request body
 * @param {*} options = { required, addBody }, default = { required: true, addBody: true }
 */
const addAuthor = options => (_ref, res, next) => {
  let {
    bodymen: {
      body
    },
    user
  } = _ref;
  const {
    required = true,
    addBody = true
  } = options !== null && options !== void 0 ? options : {};

  if (!user && !required) {
    return next();
  }

  if (!user && required) {
    res.status(400).end();
  }

  if (addBody) {
    body.author = user;
  }

  return next();
};

exports.addAuthor = addAuthor;