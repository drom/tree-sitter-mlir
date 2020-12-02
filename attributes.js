'use strict';

// Attributes

module.exports = {
  attributeDict: $ => seq(
    '{',
    optional(seq(
      $.attributeEntry,
      repeat(seq(',', $.attributeEntry))
    )),
    '}'
  ),

  attributeEntry: $ => choice(
    $.dialectAttributeEntry,
    $.dependentAttributeEntry
  ),

  dialectAttributeEntry: $ => seq(
    $.dialectNamespace,
    '.',
    $.bareId,
    '=',
    $.attributeValue
  ),

  dependentAttributeEntry: $ => seq(
    $.dependentAttributeName,
    '=',
    $.attributeValue
  ),

  simpleAttributeName: $ => /[a-zA-Z_][a-zA-Z0-9_$.]*/, // FIXME remove .

  dependentAttributeName: $ => choice(
    $.simpleAttributeName, // ((letter|[_]) (letter|digit|[_$])*)
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
    $.integerLiteral,
    optional(seq(
      ':',
      choice(
        // $.indexType,
        $.integerType
      )
    ))
  ),


  // Integer Set Attribute
  integerSetAttribute: $ => seq('affine_set', '<', $.integerSet, '>'),

  // String Attribute
  stringAttribute: $ => seq(
    $.stringLiteral,
    optional(seq(':', $.type))
  ),

  // Symbol Reference Attribute ¶
  symbolRefAttribute: $ => seq(
    $.symbolRefId, repeat(seq('::', $.symbolRefId))
  ),

  // Type Attribute
  typeAttribute: $ => $.type,

  // Unit Attribute
  unitAttribute: $ => 'unit',

};

/* eslint no-unused-vars: 1 */
/* globals grammar repeat repeat1 choice token seq optional prec field */
