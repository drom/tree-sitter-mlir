'use strict';

// 'affine' Dialect

module.exports = {

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

};

/* eslint no-unused-vars: 1 */
/* globals grammar repeat repeat1 choice token seq optional prec field */
