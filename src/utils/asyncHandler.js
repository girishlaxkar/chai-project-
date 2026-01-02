//higher order function => jo functions jo function ko as a parameter bhi accept kar skte hai ya phir usko return kar skte hai

const asyncHandler = (reqHandler) =>{
    return(req,res,next)=>{
    Promise.resolve(reqHandler(req,res,next)).catch((err)=>next(err))
}}

export {asyncHandler}; 



//below code is of try catch and if u want same code in promises than see upwards

// const asyncHandler  = (fn) => {async (req,res,next)=>{
//     try {
//         await  fn(req,res,next);
        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success : false,
//             message:error.message
//         });
//     }
// }}