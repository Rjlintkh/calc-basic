export class MathError extends Error {
    constructor(message = "") {
        super(message);
        this.name = "MathError";
    }
}

export class ArgumentError extends Error {
    constructor(message = "") {
        super(message);
        this.name = "ArgumentError";
    }
}

export class GoError extends Error {
    constructor(message = "") {
        super(message);
        this.name = "GoError";
    }
}

export class DataFull extends Error {
    constructor(message = "") {
        super(message);
        this.name = "DataFull";
    }
}