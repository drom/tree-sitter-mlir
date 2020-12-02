'use strict';

const attributes = require('./attributes.js');
const types = require('./types.js');
const affine = require('./affine.js');
const rtl = require('./rtl.js');

const PREC = {
  COMMENT: 1, // Prefer comments over regexes
};

const rules = {

  source_file: $ => repeat($._description),

  _description: $ => choice(
    $.function,
    $.module
  ),

  // digit: $ => /[0-9]/,
  hex_digit: $ => /[0-9a-fA-F]/,
  // letter: $ => /[a-zA-Z]/,
  // idPunct: $ => /[$._-]/,

  // seq(
  //   choice($.letter, $.idPunct),
  //   repeat(choice($.letter, $.idPunct, $.digit))
  // )

  integerLiteral: $ => choice(
    $.decimalLiteral,
    $.hexadecimalLiteral
  ),

  decimalLiteral: $ => /[0-9]+/ /* repeat1($.digit) */,

  hexadecimalLiteral: $ => seq('0x', repeat1($.hex_digit)),

  floatLiteral: $ => /[-+]?[0-9]+[.][0-9]*([eE][-+]?[0-9]+)?/,

  stringLiteral: $ => /"[^"\n\f\v\r]*"/,

  boolLiteral: $ => choice('true', 'false'), // FIXME undefined

  // Identifiers

  bareId: $ => /[a-zA-Z_][a-zA-Z0-9_$.]*/, // (letter|[_]) (letter|digit|[_$.])*

  bareIdList: $ => seq($.bareId, optional(seq(',', $.bareId))),

  valueId: $ => seq('%', $.suffixId),

  suffixId: $ => choice(
    /[0-9]+/ /* repeat1($.digit) */,
    seq(
      choice(
        /[a-zA-Z]/ /* $.letter */,
        /[$._-]/ /* $.idPunct */
      ),
      repeat(choice(
        /[a-zA-Z]/ /* $.letter */,
        /[$._-]/ /* $.idPunct */,
        /[0-9]/ /* $.digit */
      ))
    )
  ),


  symbolRefId: $ => seq('@', choice(
    $.suffixId,
    $.stringLiteral
  )),

  valueIdList: $ => seq(
    $.valueId,
    repeat(seq(',', $.valueId))
  ),

  // // Uses of value, e.g. in an operand list to an operation.
  valueUse: $ => $.valueId,

  valueUseList: $ => seq($.valueUse, optional(seq(',', $.valueUse))),

  operation: $ => seq(
    optional($.opResultList),
    choice(
      $.genericOperation,
      $.customOperation // FIXME not speced
    ),
    // optional($.trailingLocation) // FIXME
  ),

  genericOperation: $ => seq(
    $.stringLiteral,
    '(', optional($.valueUseList), ')',
    // optional($.successorList),
    optional(seq('(', $.regionList, ')')),
    optional($.attributeDict),
    ':',
    $.functionType
  ),

  opResultList: $ => seq(
    $.opResult,
    repeat(seq(',', $.opResult)),
    '='
  ),

  opResult: $ => seq(
    $.valueId,
    optional(seq(':', $.integerLiteral)) // FIXME spec missing optional
  ),

  successorList: $ => seq($.successor, repeat(seq(',', $.successor))),

  successor: $ => seq($.caretId, optional(seq(':', $.blockArgList))),

  regionList: $ => seq($.region, repeat(seq(',', $.region))),

  // trailingLocation: $ => optional(seq('loc', '(', $.location, ')')), // FIXME

  module: $ => seq(
    'module',
    optional($.symbolRefId),
    optional(seq('attributes', $.attributeDict)),
    $.region
  ),

  function: $ => seq(
    'func',
    optional('private'), // FIXME not in the spec
    $.functionSignature,
    optional($.functionAttributes),
    optional($.functionBody)
  ),

  functionSignature: $ => seq(
    $.symbolRefId,
    '(', optional($.argumentList), ')',
    optional(seq('->', $.functionResultList))
  ),

  argumentList: $ => choice(
    seq($.namedArgument, repeat(seq(',', $.namedArgument))),
    seq(
      $.type,
      optional($.attributeDict),
      repeat(seq(
        ',',
        $.type,
        optional($.attributeDict)
      ))
    )
  ),

  namedArgument: $ => seq(
    $.valueId,
    ':',
    $.type,
    optional($.attributeDict)
  ),

  functionResultList: $ => choice(
    $.functionResultListParens,
    $.type // FIXME undefined $.nonFunctionType
  ),

  functionResultListParens: $ => seq(
    '(',
    optional($.functionResultListNoParens),
    ')'
  ),

  functionResultListNoParens: $ => seq(
    $.functionResult,
    repeat(seq(',', $.functionResult))
  ),

  functionResult: $ => seq(
    $.type,
    optional($.attributeDict)
  ),

  functionAttributes: $ => seq('attributes', $.attributeDict),

  functionBody: $ => $.region,

  // Blocks
  block: $ => prec.left(seq(
    // SPEC: $.blockLabel,
    repeat1($.operation)
  )),

  blockLabel: $ => seq(
    $.blockId,
    optional($.blockArgList),
    ':'
  ),

  blockId: $ => $.caretId,

  caretId: $ => seq('^', $.suffixId),

  valueIdAndType: $ => seq($.valueId, ':', $.type),

  // Non-empty list of names and types.
  valueIdAndTypeList: $ => seq(
    $.valueIdAndType,
    repeat(seq(',', $.valueIdAndType))
  ),

  blockArgList: $ => seq(
    '(', optional($.valueIdAndTypeList), ')'
  ),

  // region
  region: $ => seq('{', repeat($.block), '}'),







  // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
  comment: $ => token(prec(PREC.COMMENT, choice(
    seq('//', /.*/),
    seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    )
  ))),

  customOperation: $ => choice(
    $.standardFormat,
    $.rtlFormat // rtl Dialect
  ),

  standardFormat: $ => choice(
    $.stdReturn,
    $.stdConstant
  ),

  stdReturn: $ => seq('return',
    field('result', $.valueId),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('result_type', $.type)
  ),

  stdConstant: $ => seq('constant',
    choice(
      // field('value', seq(optional('-'), $.integerAttribute)),
      field('attr', optional($.elementsAttribute))
    ),
    ':',
    field('result_type', $.type)
  ),

};

module.exports = grammar({
  name: 'mlir',
  // word: $ => $.id,
  extras: $ => [
    /\s/,
    $.comment
  ],
  inline: $ => [],
  rules: Object.assign({}, rules, types, attributes, affine, rtl)
});

/* eslint camelcase: 0 */
/* eslint no-unused-vars: 1 */
/* globals grammar repeat repeat1 choice token seq optional prec field */
