//Global handling middleware (Picks up every error found and sends back to the client when necessary )
class AppError extends Error {
    constructor(message, statusCode){
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor); //When a new object is created and the constructor function is called , that function call will not appear in the stack trace.
    }
}

module.exports = AppError;