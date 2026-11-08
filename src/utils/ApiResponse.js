class ApiResponse {
    constructor(statusCode, data,message="Success") {
        this.statusCode = statusCode < 400;
        this.success = true;
        this.data = data;  
        this.message = message;
        
    }

}

export {ApiResponse}