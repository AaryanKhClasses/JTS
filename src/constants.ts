export const KEYWORDS = new Set([
    'let', 'const', 'function', 'of',
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
])

export const Errors = {
    ErrorMissingTypeAnnotation(value: string) {
        return `JTS1001: Missing type annotation for parameter '${value}'. Did you mean '${value}: any'?`
    },
    ErrorMissingFunctionReturnTypeAnnotation(value: string) {
        return `JTS1002: Missing return type annotation for function '${value}'. Did you mean ': void'?`
    },
    ErrorUnknownType(value: string) {
        return `JTS1003: Unknown type '${value}'. Did you mean 'any'?`
    },
    ErrorEmptyArrayLiteral: 'JTS1004: Cannot infer type of empty array literal. Did you mean to specify a type annotation?',
    ErrorMixedArrayLiteralTypes: 'JTS1005: Cannot infer type of array literal with mixed types. Did you mean to specify a type annotation?',
    ErrorMissingClosingTag(tag: string) {
        return `JTS1006: Missing closing tag '${tag}'.`
    }
} as const

export const TYPE_MAP = new Map<string, string>([
    ['number', 'int'],
    ['string', 'String'],
    ['boolean', 'boolean'],
    ['void', 'void'],
    ['char', 'char'],
    ['null', 'null'],
    ['undefined', 'null'],
    ['object', 'Object'],
    ['any', 'Object']
])

export const PRIMITIVE_WRAPPERS = new Map<string, string>([
    ['int', 'Integer'],
    ['boolean', 'Boolean'],
    ['char', 'Character'],
    ['double', 'Double'],
    ['float', 'Float'],
    ['long', 'Long'],
    ['short', 'Short'],
    ['byte', 'Byte']
])

export const COLLECTION_TYPES = {
    Array: 'ArrayList',
    Set: 'Set',
    Map: 'Map'
} as const
