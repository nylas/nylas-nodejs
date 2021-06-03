export default class NylasApiError extends Error {
    statusCode: number;
    missingFields?: string[];
    serverError?: string;

    constructor(status_code: number, type: string, message: string) {
        super(message);
        this.statusCode = status_code;
        this.name = type;
    }

    toString = () => {
        return {
            type: this.name,
            message: this.message,
            statusCode: this.statusCode,
            missingFields: this.missingFields,
            serverError: this.serverError,
            stack: this.stack
        }
    }
}