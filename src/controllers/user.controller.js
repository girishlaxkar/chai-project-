import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"; //this is to hancle the error
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //we will give access token  to user
    //here we will save refresh token in db for that user  so that when user sends refresh token we can verify it with the one stored in db[so password is not required]

    user.refreshToken = refreshToken; //here as we have done hath se change so we have to save it
    await user.save({ validateBeforeSave: false }); //as we are not changing any field so we can skip validation if we dont do this it will throw error as it will try to validate all fields including password

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
};

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

  const avatarLocalPath = req.files.avatar ? req.files.avatar[0]?.path : null; //here we are using .files becouse in route we have used upload.fields([...]) which accepts multiple files so it will set req.files
  const coverImageLocalPath = req.files.coverImage
    ? req.files.coverImage[0]?.path
    : null;
  // let coverImageLocalPath;
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  //     coverImageLocalPath = req.files.coverImage[0].path;
  // }

  if (!avatarLocalPath) {
    //as avatar is required
    throw new ApiError(400, "Avatar files is required");
  }
  console.log(avatarLocalPath);
  console.log(coverImageLocalPath);
  //upload to cloudinary
  const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUploadResponse = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;
  if (!avatarUploadResponse) {
    throw new ApiError(500, "Error in uploading avatar image");
  }

  const user = await User.create({
    fullname,
    avatar: avatarUploadResponse.url,
    coverImage: coverImageUploadResponse ? coverImageUploadResponse.url : "",
    email,
    username: username.toLowerCase(),
    password,
  });

  //check whether user is created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //-password means exclude password field from response [as we dont want to send password and refresh token in response to user]

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully")); //we will make a new ApiResponse object and send it as response
});

const loginUser = asyncHandler(async (req, res, next) => {
  //steps =>1.get user details from frontend=>we will get data by req.body
  //2.validation[any input field shld not empty or in right formate][username or email and password]
  //3.check if user aldy exist:username and email
  //4.check password is correct or not
  //5.generate access token and refresh token
  //6.send cookies and response

  const { username, email, password } = req.body;
  if (!username && !password) {
    throw new ApiError(400, "Username or password is required");
  }

  // here is an alternative way to check if either username or email is provided
  // if (!(username ||  password)) {
  //   throw new ApiError(400, "Username or password is required");
  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //here we will use the method defined in user model to check password we will not use User.isPasswordCorrect as we have made these methods for instance of user not for model itself

  const isPasswordCorrect = await user.isPasswordCorrect(password); //it will throw error if password is incorrect

  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //-password means exclude password field from response [as we dont want to send password and refresh token in response to user]

  const options = {
    //the options object is a set of rules that tells the browser how to store and send the cookie
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      ) //here we are sending accessToken, refreshToken becouse some clients may need it in response body as well
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  // req.user.refreshToken = null;//we are removing refresh token from db so that it cannot be used to generate new access token
  // await req.user.save({ validateBeforeSave: false });

  // //clear cookies
  // res.clearCookie("accessToken");
  // res.clearCookie("refreshToken");

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true, //by this we will get updated document in return value of findByIdAndUpdate method
    }
  );
  const options = {
    //the options object is a set of rules that tells the browser how to store and send the cookie
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

//access token expire ho jata h to user ko dobara login na karna pade to hum refresh token ka use karte h
//so when access token expires forntend wala  call this route to get new access token using refresh token
//so we need a endpoint for frontend to call and get new access token using refresh token

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //.body is becoz some client may use mobile app where cookies are not used
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request :no refresh token provided");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?.userId);

    if (!user) {
      throw new ApiError(401, "Unauthorized request :invalid refresh token");
    }

    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(
        401,
        "Unauthorized request :refresh token is expired or used"
      );
    }

    const options = {
      //the options object is a set of rules that tells the browser how to store and send the cookie
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        ) //here we are sending accessToken, refreshToken becouse some clients may need it in response body as well
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
  //we wil check whetere user logged in or onot by using auth.middleware.js[which will set req.user as user so we can access it here]  in route
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false }); //here we are changing password so we have to save it

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const getCurrentUserProfile = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user profile fetched successfully"
      )
    ); //if user is loggedin then we must have use auth.middleware.js[it will set req.user=<user>] so we can use it here
});

//if we have to update other details of user we can make another controller function for that[u have to decide what all fields user can update in backend]
//if any where we update file then u must make seprate endpoint for that as file upload is handled by multer middleware

const updateAccountDetails = asyncHandler(async (req, res, next) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email },
    },
    {
      new: true, //by this we will get updated document in return value of findByIdAndUpdate method
    }
  ).select("-password"); //exclude password from response

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res, next) => {
  const avatarLocalPath = req.file?.path; //here we want just one file so we can use req.file
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Error in uploading avatar image");
  }

  //u can update by two ways =>

  // const user = req.user;;
  // user.avatar = avatar.url;
  // await user.save({ validateBeforeSave: false });

  //this is more efficient way as we are making just one call to db

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      new: true, //by this we will get updated document in return value of findByIdAndUpdate method
    }
  ).select("-password"); //exclude password from response
  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res, next) => {
  const coverImageLocalPath = req.file?.path; //here we want just one file so we can use req.file
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Error in uploading cover image");
  }

  //u can update by two ways =>

  // const user = req.user;;
  // user.avatar = avatar.url;
  // await user.save({ validateBeforeSave: false });

  //this is more efficient way as we are making just one call to db

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    {
      new: true, //by this we will get updated document in return value of findByIdAndUpdate method
    }
  ).select("-password"); //exclude password from response

  res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channels = await User.aggregate([
    {
      $match: {
        //this is like find method
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        //to get subscribers count we will lookup in subscription collection
        from: "subscriptions", //collection name in db
        localField: "_id", //user id
        foreignField: "channel", //channel field in subscription collection
        as: "subscribers", //we will get array of subscribers
      },
    },
    {
      $lookup: {
        //to get channels subscribed to count
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" }, //here we use $size operator to count number of elements in array
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          //this is to check whether current logged in user is subscribed to this channel or not
          $cond: {
            //condition operator
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        //to include or exclude fields from result
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]); //here we will get array of channels but as username is unique so we will get only one channel

  if (!channels?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels[0],
        "User channel profile fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res, next) => {
  const user = await User.aggregate([
    {
      $match: {
        //before in getUserChannelProfile we used username to match but here we want current logged in user so we will use _id from req.user
        // _id: req.user?._id,//here mongoose will not work aggregation pipeline code directly goes to mongodb so we have to convert it to ObjectId
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos", //here videos because in mongodb collection name is plural of model name[Video->videos]
        localField: "watchHistory.video",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          //here we have to  use subpipeline for getting owner details of each video in watch history
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [//as here ownerdetails will have lot of unnecessary fields so we will project only required fields
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                //here we will get array with single user object as owner is single user so we will unwind it
                {
                  $addFields: {//to convert array to object so that in frontend we dont have to do ownerDetails[0] to access owner details
                    owner:{
                      $first:"$ownerDetails"
                    }
                  },
                },

              ]
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory || [],
        "User watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUserProfile,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
