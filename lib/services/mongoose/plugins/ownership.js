"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ownership;

/**
 * This plugin adds a static function to your schema which checks if a given user is the owner of a document
 * You can either use the default function as defined below
 * or define a custom function which gets the mongoDB document and your jwt user
 * Your function should return a boolean value
 * @export
 * @param {*} schema
 * @param {*} [{ custom }={}] pass a custom checkOwnership function which will get used instead of the default
 */
function ownership(schema) {
  let {
    custom
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  schema.statics.isOwner = function (doc, user) {
    if (custom) {
      return custom(doc, user);
    } // default is admin or author === user._id. Works for populated author too


    return user.role === 'admin' || doc.author._id.toString() === user._id || doc.author.toString() === user._id;
  };
}