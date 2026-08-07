export enum DiagnosticSeverity {
    Error, Warning
}

export interface Diagnostic {
    code: string
    severity: DiagnosticSeverity
    message: string
    start: number
    end: number
    suggestion?: string
}

export class DiagnosticReporter {
    private readonly diagnostics: Diagnostic[] = []

    public error(code: string, message: string, start: number, end: number, suggestion?: string) {
        this.diagnostics.push({
            code,
            severity: DiagnosticSeverity.Error,
            message,
            start,
            end,
            suggestion
        })
    }

    public warning(code: string, message: string, start: number, end: number, suggestion?: string) {
        this.diagnostics.push({
            code,
            severity: DiagnosticSeverity.Warning,
            message,
            start,
            end,
            suggestion
        })
    }

    public hasErrors(): boolean {
        return this.diagnostics.some(d => d.severity === DiagnosticSeverity.Error)
    }

    public getDiagnostics(): Diagnostic[] {
        return this.diagnostics
    }
}
