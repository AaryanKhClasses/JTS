export const Constants = {
    ErrorMissingTypeAnnotation(value: string) {
        return `JTS1001: Missing type annotation for parameter '${value}'. Did you mean '${value}: any'?`
    },
    ErrorMissingFunctionReturnTypeAnnotation(value: string) {
        return `JTS1002: Missing return type annotation for function '${value}'. Did you mean ': void'?`
    },
    ErrorUnknownType(value: string) {
        return `JTS1003: Unknown type '${value}'. Did you mean 'any'?`
    }
} as const

export const TYPE_MAP = new Map<string, string>([
    ['number', 'int'],
    ['string', 'String'],
    ['boolean', 'boolean'],
    ['void', 'void'],
    ['any', 'Object']
])
