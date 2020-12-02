'use strict';

// Type System

module.exports = {
  type: $ => choice(
    // $.typeAlias,
    $.dialectType,
    $.standardType
  ),

  typeListNoParens: $ => seq(
    $.type,
    repeat(seq(',', $.type))
  ),

  typeListParens: $ => seq(
    '(',
    optional($.typeListNoParens),
    ')'
  ),

  // // This is a common way to refer to a value with a specified type.
  // ssaUseAndType: $ => seq(
  //   $.valueId,  // FIXME undefined ssa-use. replace with value-id?
  //   ':',
  //   $.type
  // ),
  //
  // // Non-empty list of names and types.
  // // ssaUseAndTypeList: $ => seq($.ssaUseAndType, repeat(seq(',', $.ssaUseAndType))), // FIXME unused
  //

  // Type Aliases
  typeAliasDef: $ => seq('!', $.aliasName, '=', 'type', $.type), // FIXME unused

  typeAlias: $ => seq('!', $.aliasName),

  // FIXME unspecified. guess
  aliasName: $ => /[a-zA-Z]+/,

  // Dialect Types
  dialectNamespace: $ => $.bareId,

  opaqueDialectItem: $ => seq(
    $.dialectNamespace,
    '<',
    $.stringLiteral,
    '>'
  ),

  prettyDialectItem: $ => seq(
    $.dialectNamespace,
    '.', $.prettyDialectItemLeadIdent,
    optional($.prettyDialectItemBody)
  ),

  prettyDialectItemLeadIdent: $ => /[A-Za-z][A-Za-z0-9._]*/,

  prettyDialectItemBody: $ => seq('<', repeat1($.prettyDialectItemContents), '>'),

  prettyDialectItemContents: $ => choice(
    $.prettyDialectItemBody,
    seq('(', repeat1($.prettyDialectItemContents), ')'),
    seq('[', repeat1($.prettyDialectItemContents), ']'),
    seq('{', repeat1($.prettyDialectItemContents), '}'),
    /[^>]*/, // FIXME broken RegExp
  ),

  dialectType: $ => seq(
    '!',
    choice(
      $.opaqueDialectItem,
      $.prettyDialectItem
    )
  ),

  // Standard Types
  standardType: $ => choice(
    $.complexType,
    $.floatType,
    // $.functionType,
    $.indexType,
    $.integerType,
    $.memrefType,
    $.noneType,
    $.tensorType,
    $.tupleType,
    $.vectorType
  ),

  // Complex Type
  complexType: $ => seq('complex', '<', $.type, '>'),

  // Floating Point Types
  floatType: $ => choice('f16', 'bf16', 'f32', 'f64'),

  // Function Type
  // MLIR functions can return multiple values.
  functionResultType: $ => choice(
    $.typeListParens,
    $.type // SPEC $.nonFunctionType
  ),

  functionType: $ => seq($.typeListParens, '->', $.functionResultType),

  // Index Type
  // Target word-sized integer.
  indexType: $ => 'index',


  // Integer Type
  // Sized integers like i1, i4, i8, i16, i32.
  signedIntegerType: $ => seq('si', /[1-9][0-9]*/),
  unsignedIntegerType: $ => seq('ui', /[1-9][0-9]*/),
  signlessIntegerType: $ => seq('i', /[1-9][0-9]*/),

  integerType: $ => choice(
    $.signedIntegerType,
    $.unsignedIntegerType,
    $.signlessIntegerType
  ),

  // Memref Type
  memrefType: $ => choice(
    $.rankedMemrefType,
    $.unrankedMemrefType
  ),

  rankedMemrefType: $ => seq(
    'memref', '<',
    optional($.dimensionListRanked),
    $.tensorMemrefElementType,
    optional(seq(',', $.layoutSpecification)),
    optional(seq(',', $.memorySpace)),
    '>'
  ),

  unrankedMemrefType: $ => seq(
    'memref', '<*x',
    $.tensorMemrefElementType,
    optional(seq(',', $.memorySpace)),
    '>'
  ),

  strideList: $ => seq(
    '[',
    optional(seq(
      $.dimension,
      repeat(seq(',', $.dimension))
    )),
    ']'
  ),

  stridedLayout: $ => seq(
    'offset:', $.dimension, ',',
    'strides: ', $.strideList
  ),

  layoutSpecification: $ => choice(
    $.semiAffineMap,
    $.stridedLayout
  ),

  memorySpace: $ => $.integerLiteral, /* | TODO: address-space-id */

  // None Type
  noneType: $ => 'none',

  // Tensor Type
  tensorType: $ => seq('tensor',
    '<',
    $.dimensionList,
    $.tensorMemrefElementType,
    '>'
  ),

  tensorMemrefElementType: $ => choice(
    $.vectorElementType,
    $.vectorType,
    $.complexType
  ),

  // memref requires a known rank, but tensor does not.
  dimensionList: $ => choice(
    $.dimensionListRanked,
    seq('*', 'x')
  ),

  dimensionListRanked: $ => repeat1(
    seq($.dimension, 'x')
  ), // repeat(seq($.dimension, 'x')), FIXME match empty string

  dimension: $ => choice(
    '?',
    $.decimalLiteral
  ),

  // Tuple Type
  tupleType: $ => seq('tuple',
    '<',
    optional(seq($.type, repeat(seq(',', $.type)))),
    '>'
  ),

  // Vector Type
  vectorType: $ => seq('vector',
    '<',
    $.staticDimensionList,
    $.vectorElementType,
    '>'
  ),

  vectorElementType: $ => choice(
    $.floatType,
    $.integerType
  ),

  staticDimensionList: $ => repeat1(seq($.decimalLiteral, 'x')),

};

/* eslint no-unused-vars: 1 */
/* globals grammar repeat repeat1 choice token seq optional prec field */
