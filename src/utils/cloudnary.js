//here we will handle filē alrdy uploads on server and from server we wil get localpath and  with help of that we will upload it on cloudnary
import { v2 as cloudinary } from "cloudinary"; //as here v2 is not looking good so we will give it a name cloudnary
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",//it will automatically detect the type of file
    });
    console.log("file uploaded on cloudinary ", response.url); 
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);//remove the file from local server if any error occurs
    console.log("Error in uploading file on cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary };