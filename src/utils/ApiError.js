class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong", 
        erorrs = [],
        statck = ""

    ){
        super(message);
        this.statusCode = statusCode;
        this.erorrs = erorrs;
        this.data  =null,
        this.success = false ,
        this.message = message

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}