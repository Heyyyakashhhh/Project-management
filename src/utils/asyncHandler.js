const asyncHandler = (reqHandler)=>{
    return (req, res, next)=>{
        Promise.resolve(reqHandler(req,res,nect)).catch((error)=>next(error))
    }
}

export {asyncHandler}