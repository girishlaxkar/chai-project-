import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUserProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "http";

const router = Router();

// upload.fields([...]) → Multer middleware for handling multiple file inputs
// Each object in the array defines a field name and how many files it can accept

// { name: "avatar", maxCount: 1 }
// - Looks for <input type="file" name="avatar" />
// - Allows max 1 file for that field

// { name: "coverImage", maxCount: 1 }
// - Looks for <input type="file" name="coverImage" />
// - Allows max 1 file for that field

// Result: req.files will be an object keyed by field names
// Example:
// req.files = {
//   avatar: [ { file metadata } ],
//   coverImage: [ { file metadata } ]
// }

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-access-token").post(refreshAccessToken); //to be implemented in future
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUserProfile);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile); //here username is dynamic parameter as in url we will pass username whose channel we want to see[for accessing username use req.params.username in controller]

router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default router;
