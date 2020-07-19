"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emailValidator = exports.passwordValidator = void 0;
// lmao dont @ me
const passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/; // eslint-disable-next-line max-len

exports.passwordValidator = passwordValidator;
const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
exports.emailValidator = emailValidator;