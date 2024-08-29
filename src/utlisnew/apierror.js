class apiError extends Error{
    constructor(
        statusCode,
        messsage =" Something went wrong",
        errors = [],
        stack =""
    ){
        super(messsage)
        this.statusCode = statusCode
        this.message= messsage
        this.data = null
        this.success = false
        this.error = errors

    }
}
export {apiError}