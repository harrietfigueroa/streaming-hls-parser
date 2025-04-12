export class HLSValidationError extends Error {
    constructor(message: string, options: ConstructorParameters<typeof Error>['1']) {
        super(message);
    }
}
