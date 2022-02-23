export function validateName(name: string): boolean {
  return /^[a-zA-Z0-9\.]*$/.test(name);
}

export class CommandError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CommandError);
    }

    this.name = "CustomError";
    // Custom debugging information
    // this.foo = foo
  }
}
