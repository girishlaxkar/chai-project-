import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"; //this is to hancle the error
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res, next) => {
  //steps =>1.get user details from frontend=>we will get data by req.body but we cannot get files directly so we will use multer middleware.[upload.fields..in route]
  //2.validation[any input field shld not empty or in right formate]
  //3.check if user aldy exist:username and email
  //4.check agr hamari files h k ni for images and avatar//as they are required
  //5.if available then upload them to cloudinary ,avatar
  //6.create user object - create entryin db
  //7.remove password and refresh token field from response
  //8.check for usercreation
  //9.return response

  const { fullname, email, username, password } = req.body;
  
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    } 

    
    const avatarLocalPath = req.files.avatar?req.files.avatar[0]?.path:null;
    const coverImageLocalPath = req.files.coverImage?req.files.coverImage[0]?.path:null ;
// let coverImageLocalPath;
// if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
//     coverImageLocalPath = req.files.coverImage[0].path;
// }

    if (!avatarLocalPath ) {//as avatar is required
        throw new ApiError(400, "Avatar files is required");
    }  
    console.log(avatarLocalPath);
    console.log(coverImageLocalPath);
    //upload to cloudinary
    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUploadResponse = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;
    if(!avatarUploadResponse){
        throw new ApiError(500,"Error in uploading avatar image");
    }

  const user = await User.create({
        fullname,
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse
          ? coverImageUploadResponse.url
          : "",
        email,
        username:username.toLowerCase(),
        password,
    })

    //check whether user is created or not
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    ); //-password means exclude password field from response [as we dont want to send password and refresh token in response to user]

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));//we will make a new ApiResponse object and send it as response

});

export { registerUser };
