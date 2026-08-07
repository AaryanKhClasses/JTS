export const KEYWORDS = new Set([
    'let', 'const', 'function', 'of',
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
])

export const Errors = {
    ErrorMissingTypeAnnotation(value: string) {
        return {
            code: 'JTS1001',
            message: `Missing type annotation for variable '${value}'.`,
            suggestion: `Did you mean ': any'?`
        }
    },
    ErrorMissingFunctionReturnTypeAnnotation(value: string) {
        return {
            code: 'JTS1002',
            message: `Missing return type annotation for function '${value}'.`,
            suggestion: `Did you mean ': void'?`
        }
    },
    ErrorUnknownType(value: string) {
        return {
            code: 'JTS1003',
            message: `Unknown type '${value}'.`,
            suggestion: `Did you mean 'any'?`
        }
    },
    ErrorEmptyArrayLiteral: {
        code: 'JTS1004',
        message: 'Cannot infer type of empty array literal.',
        suggestion: 'Did you mean to specify a type annotation?'
    },
    ErrorMixedArrayLiteralTypes: {
        code: 'JTS1005',
        message: 'Cannot infer type of array literal with mixed types.',
        suggestion: 'Did you mean to specify a type annotation?'
    },
    ErrorMissingClosingTag(tag: string) {
        return {
            code: 'JTS1006',
            message: `Missing closing tag '${tag}'.`
        }
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
