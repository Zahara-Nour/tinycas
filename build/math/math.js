"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.math = math;

var _decimal = _interopRequireDefault(require("decimal.js"));

var _node = require("./node.js");

var _parser = _interopRequireDefault(require("./parser.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function math(exp, options) {
  var e;

  if (typeof exp === "number" || _decimal["default"].isDecimal(exp)) {
    e = (0, _node.number)(exp);
  } else {
    e = (0, _parser["default"])(options).parse(exp);
  }

  return e;
}