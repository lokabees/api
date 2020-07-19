"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendPasswordResetMail = exports.sendVerificationMail = exports.sendDynamicMail = void 0;

var _mail = _interopRequireDefault(require("@sendgrid/mail"));

var _config = require("../../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  apiKey,
  defaultEmail,
  emailTemplates
} = _config.sendgrid;

_mail.default.setApiKey(apiKey); // relevant github issue: https://github.com/sendgrid/sendgrid-nodejs/issues/1128


const mail_settings = {
  sandbox_mode: {
    enable: _config.env !== 'production'
  }
};

const sendDynamicMail = (_ref) => {
  let {
    from = defaultEmail,
    to,
    templateId,
    dynamic_template_data
  } = _ref;
  return _mail.default.send({
    to,
    from,
    templateId,
    dynamic_template_data,
    mail_settings
  });
};

exports.sendDynamicMail = sendDynamicMail;

const passwordResetLink = token => _config.env !== 'production' ? `http://${_config.ip}:${_config.port}${_config.apiRoot}/password-reset/${token}` : `${process.env.APP_URL}/account/password-reset/${token}`;

const verificationLink = token => _config.env !== 'production' ? `http://${_config.ip}:${_config.port}${_config.apiRoot}/verification/${token}` : `${process.env.APP_URL}/account/verify/${token}`;

const sendVerificationMail = (_ref2) => {
  let {
    to,
    name,
    token
  } = _ref2;
  return _mail.default.send({
    to,
    from: defaultEmail,
    templateId: emailTemplates.welcome,
    dynamic_template_data: {
      username: name,
      link: verificationLink(token)
    },
    mail_settings
  });
};

exports.sendVerificationMail = sendVerificationMail;

const sendPasswordResetMail = (_ref3) => {
  let {
    to,
    name,
    token
  } = _ref3;
  return _mail.default.send({
    to,
    from: defaultEmail,
    templateId: emailTemplates.forgot,
    dynamic_template_data: {
      username: name,
      link: passwordResetLink(token)
    },
    mail_settings
  });
};

exports.sendPasswordResetMail = sendPasswordResetMail;