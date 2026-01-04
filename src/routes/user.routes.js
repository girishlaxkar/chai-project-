import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

export default router;
