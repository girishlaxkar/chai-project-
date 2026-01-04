//here we will handle filē alrdy uploads on server and from server we wil get localpath and  with help of that we will upload it on cloudnary
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary"; //as here v2 is not looking good so we will give it a name cloudnary
import fs from "fs";
import path from "path";
import { log } from "console";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const normalizedPath = path.normalize(localFilePath);
        console.log("Normalized Path:", normalizedPath);
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(normalizedPath, {
      resource_type: "auto",//it will automatically detect the type of file
      timeout: 60000,//timeout in ms
    });
    console.log(response);
    
    fs.unlinkSync(normalizedPath);//remove the file from local server after successful upload   
    // console.log("file uploaded on cloudinary ", response.url); 
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);//remove the file from local server if any error occurs
    console.log("Error in uploading file on cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary };