'use strict';

const PREC = {
  COMMENT: 1, // Prefer comments over regexes
};

const rules = {

  // comment: $ => token(choice(
  //   seq('//', /.*/),
  //   seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
  // )),

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

  // bareIdList: $ => seq($.bareId, optional(seq(',', $.bareId))),

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

  valueIdList: $ => seq($.valueId, optional(seq(',', $.valueId))),

  // // Uses of value, e.g. in an operand list to an operation.
  valueUse: $ => $.valueId,

  valueUseList: $ => seq($.valueUse, optional(seq(',', $.valueUse))),

  operation: $ => seq(
    optional($.opResultList),
    choice(
      $.genericOperation,
      // $.customOperation // FIXME
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

  // // customOperation: $ => seq($.bareId, $.customOperationFormat), // FIXME
  //
  opResultList: $ => seq($.opResult, repeat(seq(',', $.opResult)), '='),

  opResult: $ => seq($.valueId, ':', $.integerLiteral),

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
  block: $ => seq($.blockLabel, repeat1($.operation)),
  blockLabel: $ => seq($.blockId, optional($.blockArgList), ':'),
  blockId: $ => $.caretId,
  caretId: $ => seq('^', $.suffixId),
  valueIdAndType: $ => seq($.valueId, ':', $.type),

  // Non-empty list of names and types.
  valueIdAndTypeList: $ => seq($.valueIdAndType, repeat(seq(',', $.valueIdAndType))),
  blockArgList: $ => seq('(', optional($.valueIdAndTypeList), ')'),

  // region
  region: $ => seq('{', repeat($.block), '}'),


  // Type System
  type: $ => choice(
    // $.typeAlias,
    // $.dialectType,
    $.standardType
  ),

  typeListNoParens: $ => seq($.type, repeat(seq(',', $.type))),

  typeListParens: $ => seq('(', optional($.typeListNoParens), ')'),

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
  // // Type Aliases
  // // typeAliasDef: $ => seq('!', $.aliasName, '=', 'type', $.type), // FIXME unused
  // typeAlias: $ => seq('!', $.aliasName),

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
    seq('{', repeat1($.prettyDialectItemContents), '}')
    // repeat1(/[^[<({>\])}\0]), // FIXME broken RegExp
  ),

  dialectType: $ => seq('!', choice($.opaqueDialectItem, $.prettyDialectItem)),

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
    // $.nonFunctionType // FIXME undefined
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

  // Attributes
  attributeDict: $ => seq(
    '{',
    optional(seq($.attributeEntry, repeat(seq(',', $.attributeEntry)))),
    '}'
  ),

  attributeEntry: $ => choice(
    $.dialectAttributeEntry,
    $.dependentAttributeEntry
  ),

  dialectAttributeEntry: $ =>
    seq($.dialectNamespace, '.', $.bareId, '=', $.attributeValue),

  dependentAttributeEntry: $ => seq(
    $.dependentAttributeName, '=', $.attributeValue
  ),

  dependentAttributeName: $ => choice(
    /[a-zA-Z_][a-zA-Z0-9_$]*/, // ((letter|[_]) (letter|digit|[_$])*)
    $.stringLiteral
  ),

  attributeValue: $ => choice(
    $.attributeAlias,
    $.dialectAttribute,
    $.standardAttribute
  ),

  // Attribute Value Aliases
  attributeAlias: $ => seq('#', $.aliasName, optional(seq('=', $.attributeValue))),

  // Dialect Attribute Values
  dialectAttribute: $ => seq('#', choice(
    $.opaqueDialectItem,
    $.prettyDialectItem
  )),

  // Standard Attribute Values
  standardAttribute: $ => choice(
    $.affineMapAttribute,
    $.arrayAttribute,
    $.boolAttribute,
    $.dictionaryAttribute,
    $.elementsAttribute,
    $.floatAttribute,
    // $.integerAttribute,// conflict with $.floatAttribute
    $.integerSetAttribute,
    $.stringAttribute,
    $.symbolRefAttribute,
    $.typeAttribute,
    $.unitAttribute
  ),

  // AffineMap Attribute
  affineMapAttribute: $ => seq('affine_map', '<', $.affineMap, '>'),

  // Array Attribute
  arrayAttribute: $ => seq(
    '[',
    optional(seq($.attributeValue, repeat(seq(',', $.attributeValue)))),
    ']'
  ),

  // Boolean Attribute
  boolAttribute: $ => $.boolLiteral, // FIXME undefined in spec

  // Dictionary Attribute
  dictionaryAttribute: $ => seq(
    '{',
    optional(seq($.attributeEntry, repeat(seq(',', $.attributeEntry)))),
    '}'
  ),

  // Elements Attributes
  elementsAttribute: $ => choice(
    $.denseElementsAttribute,
    $.opaqueElementsAttribute,
    $.sparseElementsAttribute
  ),

  // Dense Elements Attribute
  denseElementsAttribute: $ => seq(
    'dense',
    '<',
    $.attributeValue,
    '>',
    ':', choice($.tensorType, $.vectorType)
  ),

  // Opaque Elements Attribute
  opaqueElementsAttribute: $ => seq(
    'opaque',
    '<',
    $.dialectNamespace,
    ',',
    $.hexadecimalLiteral, // $.hexStringLiteral, // FIXME undefined
    '>',
    ':',
    choice($.tensorType, $.vectorType)
  ),

  // Sparse Elements Attribute
  sparseElementsAttribute: $ => seq(
    'sparse',
    '<',
    $.attributeValue,
    ',',
    $.attributeValue,
    '>',
    ':',
    choice($.tensorType, $.vectorType)
  ),

  // Float Attribute
  floatAttribute: $ => choice(
    seq($.floatLiteral, optional(seq(':', $.floatType))),
    seq($.hexadecimalLiteral, ':', $.floatType)
  ),

  // Integer Attribute
  integerAttribute: $ => seq(
    $.integerLiteral, optional(seq(':', choice($.indexType, $.integerType)))
  ),


  // Integer Set Attribute
  integerSetAttribute: $ => seq('affine_set', '<', $.integerSet, '>'),

  // String Attribute
  stringAttribute: $ => seq($.stringLiteral, optional(seq(':', $.type))),

  // Symbol Reference Attribute ¶
  symbolRefAttribute: $ => seq(
    $.symbolRefId, repeat(seq('::', $.symbolRefId))
  ),

  // Type Attribute
  typeAttribute: $ => $.type,

  // Unit Attribute
  unitAttribute: $ => 'unit',


  // 'affine' Dialect

  // Dimensions and Symbols
  // Uses of SSA values that are passed to dimensional identifiers.
  dimUseList: $ => seq(
    '(',
    repeat($.valueId), // optional($.ssaUseList), // FIXME ssa-use-list undefined ->
    ')'
  ),

  // Uses of SSA values that are used to bind symbols.
  symbolUseList: $ => seq(
    '[',
    repeat($.valueId), // optional($.ssaUseList), // FIXME ssa-use-list undefined ->
    ']'
  ),

  // Most things that bind SSA values bind dimensions and symbols.
  dimAndSymbolUseList: $ => seq($.dimUseList, optional($.symbolUseList)),


  // Affine Expressions

  affineExpr: $ => choice(
    seq('(', $.affineExpr, ')'),
    // seq($.affineExpr, '+', $.affineExpr),
    // seq($.affineExpr, '-', $.affineExpr),
    // seq(optional('-'), $.integerLiteral, '*', $.affineExpr),
    seq($.affineExpr, 'ceildiv', $.integerLiteral),
    seq($.affineExpr, 'floordiv', $.integerLiteral),
    seq($.affineExpr, 'mod', $.integerLiteral),
    // seq('-', $.affineExpr),
    $.bareId,
    seq(optional('-'), $.integerLiteral)
  ),

  multiDimAffineExpr: $ => seq(
    '(',
    optional(seq(
      $.affineExpr,
      repeat(seq(',', $.affineExpr))
    )),
    ')'
  ),


  // Affine Maps

  affineMapInline: $ => seq(
    $.dimAndSymbolUseList, // FIXME dimAndSymbolIdLists undefined.
    '->',
    $.multiDimAffineExpr
  ),

  // Named affine mappings
  affineMapId: $ => seq('#', $.suffixId),

  // // Definitions of affine maps are at the top of the file.
  // affineMapDef: $ => seq($.affineMapId, '=', $.affineMapInline),
  //
  // moduleHeaderDef: $ => $.affineMapDef, // FIXME duplicate

  // Uses of affine maps may use the inline form or the named form.
  affineMap: $ => choice(
    $.affineMapId,
    $.affineMapInline
  ),


  // Semi-affine maps

  semiAffineExpr: $ => choice(
    seq('(', $.semiAffineExpr, ')'),
    // seq($.semiAffineExpr, '+', $.semiAffineExpr),
    // seq($.semiAffineExpr, '-', $.semiAffineExpr),
    // seq($.symbolOrConst, '*', $.semiAffineExpr),
    seq($.semiAffineExpr, 'ceildiv', $.symbolOrConst),
    seq($.semiAffineExpr, 'floordiv', $.symbolOrConst),
    seq($.semiAffineExpr, 'mod', $.symbolOrConst),
    $.bareId,
    // seq(optional('-'), $.integerLiteral)
  ),

  symbolOrConst: $ => seq(optional('-'), choice($.integerLiteral, $.symbolRefId)),
  // FIXME symbol-id is undefined in spec, temp replacemen with symbol-ref-id

  multiDimSemiAffineExpr: $ => seq(
    '(', $.semiAffineExpr, repeat(seq(',', $.semiAffineExpr)), ')'
  ),

  semiAffineMapInline: $ => seq(
    $.dimAndSymbolUseList, // FIXME dimAndSymbolIdLists undefined.
    '->',
    $.multiDimSemiAffineExpr
  ),

  semiAffineMapId: $ => seq('#', $.suffixId),

  semiAffineMapDef: $ => seq($.semiAffineMapId, '=', $.semiAffineMapInline),

  moduleHeaderDef: $ => $.semiAffineMapDef,

  // Uses of semi-affine maps may use the inline form or the named form.
  semiAffineMap: $ => choice(
    $.semiAffineMapId,
    $.semiAffineMapInline
  ),

  // Integer Sets
  affineConstraint: $ => seq($.affineExpr, choice('>=', '=='), '0'),

  affineConstraintConjunction: $ => seq(
    $.affineConstraint, repeat(seq(',', $.affineConstraint))
  ),

  integerSetId: $ => seq('#', $.suffixId),

  integerSetInline: $ => seq(
    $.dimAndSymbolUseList, // FIXME dimAndSymbolIdLists undefined.
    ':',
    '(',
    optional($.affineConstraintConjunction),
    ')'
  ),

  // Declarations of integer sets are at the top of the file.
  integerSetDecl: $ => seq($.integerSetId, '=', $.integerSetInline),

  // Uses of integer sets may use the inline form or the named form.
  integerSet: $ => choice($.integerSetId, $.integerSetInline),


  // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
  comment: $ => token(prec(PREC.COMMENT, choice(
    seq('//', /.*/),
    seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/'
    )
  ))),
};

module.exports = grammar({
  name: 'mlir',
  // word: $ => $.id,
  extras: $ => [
    /\s/,
    $.comment
  ],
  inline: $ => [],
  rules: rules
});

/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 */
/* globals grammar repeat repeat1 choice token seq optional prec */
