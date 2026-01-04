import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req,_, next) => {//SOME u will find that res is not used so we will put _ in place of res 
   try {
    const token = req.cookies?.accessToken || req.header
     ("Authorization")?.replace("Bearer ","");//optional chaining is used to avoid error if cookies is undefined
     if(!token){
         throw new ApiError(401,"Unauthorized: No token provided");
     }
 
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);//here we will have id in decodedToken
 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")//
     if(!user){  
         throw new ApiError(401,"Unauthorized: User not found");
     }
     req.user = user;//we are attaching user to req object so that we can access it in next middlewares or controllers
     next();//if everything is fine then we will call next to proceed to next middleware or controller   
 
   } catch (error) {
    throw new ApiError(401,error?.message || "Unauthorized: Invalid token");
   }
})









//     {
//   host: 'localhost:8000',
//   connection: 'keep-alive',
//   'content-length': '123',
//   'content-type': 'application/json',
//   'user-agent': 'Mozilla/5.0...',
//   accept: 'application/json',
//   authorization: 'Bearer <access_token>',
//   cookie: 'sessionId=abc123',
//   referer: 'http://localhost:8000/',
//   origin: 'http://localhost:8000'
// }
