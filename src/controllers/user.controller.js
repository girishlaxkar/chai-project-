import { asyncHandler } from "../utils/asyncHandler.js";//this is to hancle the error 

const registerUser = asyncHandler(async (req, res, next) => {
    res.status(201).json({
        success: true,
        message: "User registered successfully"
    });
})

export { registerUser };    