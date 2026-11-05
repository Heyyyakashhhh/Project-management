class ApiResponse {
    constructor(statusCode, message="Success", data) {
        this.statusCode = statusCode < 400;
        this.success = true;
        this.message = message;
        this.data = data;   
        
    }

}

export {ApiResponse}