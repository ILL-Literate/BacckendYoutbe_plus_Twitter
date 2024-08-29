// //using promises
const asyncHandler = (requestHandler)=>{
    return(req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((e)=>next(e))
    }
}
export {asyncHandler}






// // const asyncHandler = () => {}
// // const asyncHandler = (func) => () => {}
// // const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn)=> async(req,res, next)=>{
//     try{
//         await fn(req,res,next)

//     }
//     catch(e){
//         res.status(e.code|| 500).json({
//             success: false,
//             message: e.message
//         })

//     }

// }

// export {asyncHandler}