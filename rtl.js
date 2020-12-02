'use strict';

// 'circt/rtl' Dialect

module.exports = {
  rtlFormat: $ => seq(
    'rtl', '.',
    choice(
      // Combinatorial.td
      $.rtlConstantOp,
      $.rtlUTBinRTLOp,
      $.rtlVariadicRTLOp,
      $.rtlUTVariadicRTLOp,
      $.rtlICmpOp,
      $.rtlUnaryI1ReductionRTLOp,
      $.rtlExtractOp,
      $.rtlSZExtOp,
      $.rtlMuxOp,
      // Statements.td
      $.rtlConnectOp,
      $.rtlWireOp,
      // Structure.td
      $.rtlRTLModuleOp,
      $.rtlRTLExternModuleOp,
      $.rtlInstanceOp,
      $.rtlOutputOp,
    )
  ),

  // Combinatorial.td

  rtlConstantOp: $ => seq('constant',
    optional(seq('(', field('value', seq(optional('-'), $.integerAttribute)), ')')),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('result_type', $.type)
  ),

  rtlUTBinRTLOp: $ => seq(choice('sub', 'divu', 'divs', 'modu', 'mods', 'shl', 'shru', 'shrs'),
    field('lhs', $.valueId), ',', field('rhs', $.valueId),
    optional($.attributeDict),
    ':',
    field('result_type', $.type)
  ),

  rtlVariadicRTLOp: $ => seq('concat',
    field('inputs', $.valueIdList),
    field('attr_dict', optional($.attributeDict)),
    ':',
    '(', field('inputs_types', $.typeListNoParens), ')', '->', field('result_type', $.type)
  ),

  rtlUTVariadicRTLOp: $ => seq(choice('add', 'mul', 'and', 'or', 'xor'),
    field('inputs', $.valueIdList),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('result_type', $.type)
  ),

  rtlICmpOp: $ => seq('icmp',
    field('predicate', seq(
      '"',
      choice('eq', 'ne', 'slt', 'sle', 'sgt', 'sge', 'ult', 'ule', 'ugt', 'uge'),
      '"'
    )),
    field('lhs', $.valueId), ',', field('rhs', $.valueId),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('lhs_type', $.type)
  ),

  rtlUnaryI1ReductionRTLOp: $ => seq(choice('andr', 'orr', 'xorr'),
    field('input', $.valueId),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('input_type', $.type)
  ),

  rtlExtractOp: $ => seq('extract',
    field('input', $.valueId),
    'from',
    field('lowBit', $.integerLiteral),
    field('attr_dict', optional($.attributeDict)),
    ':',
    '(', field('input_type', $.type), ')', '->', field('result_type', $.type)
  ),

  rtlSZExtOp: $ => seq(choice('sext', 'zext'),
    field('input', $.valueId),
    field('attr_dict', optional($.attributeDict)),
    ':',
    '(', field('input_type', $.type), ')', '->', field('result_type', $.type)
  ),

  rtlMuxOp: $ => seq('mux',
    field('cond', $.valueId), // FIXME i1
    ',',
    field('trueValue', $.valueId),
    ',',
    field('falseValue', $.valueId),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('result_type', $.type)
  ),

  // Statements.td

  rtlConnectOp: $ => seq('connect',
    field('dest', $.valueId),
    ',',
    field('src', $.valueId),
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('dest_type', $.type)
  ),

  rtlWireOp: $ => seq('wire',
    field('attr_dict', optional($.attributeDict)),
    ':',
    field('result_type', $.type)
  ),

  // Structure.td

  rtlRTLModuleOp: $ => seq(
    field('operation', 'module'),
    field('moduleName', $.symbolRefAttribute),
    '(', field('inputs_types', optional($.argumentList)), ')',
    optional(seq(
      '->',
      '(',
      field('results_types', seq(
        seq(optional(seq($.valueId, ':')), $.type, optional($.attributeDict)),
        repeat(seq(',', optional(seq($.valueId, ':')), $.type, optional($.attributeDict)))
      )),
      ')'
    )),
    optional(seq('attributes', $.attributeDict)),
    $.region
  ),

  rtlRTLExternModuleOp: $ => seq(
    field('operation', 'externmodule'),
    field('moduleName', $.symbolRefAttribute),
    '(',
    field('inputs_types', optional($.argumentList)),
    ')',
    optional(seq(
      '->',
      '(',
      field('results_types', seq(
        seq(optional(seq($.valueId, ':')), $.type, optional($.attributeDict)),
        repeat(seq(',', optional(seq($.valueId, ':')), $.type, optional($.attributeDict)))
      )),
      ')'
    )),
    optional(seq('attributes', $.attributeDict)),
  ),

  rtlInstanceOp: $ => seq(
    'instance',
    field('instanceName', $.stringAttribute),
    field('moduleName', $.symbolRefAttribute),
    '(', field('inputs', $.valueIdList), ')',
    field('attr_dict', optional($.attributeDict)),
    ':',
    '(', field('inputs_types', $.typeListNoParens), ')',
    '->',
    '(', field('results_types', $.typeListNoParens), ')'
  ),

  rtlOutputOp: $ => seq(
    'output',
    field('attr_dict', optional($.attributeDict)),
    seq( // FIXME optional?
      field('operands', $.valueIdList),
      ':',
      field('operands_types', $.typeListNoParens)
    )
  ),

};

/* eslint no-unused-vars: 1 */
/* globals grammar repeat repeat1 choice token seq optional prec field */
