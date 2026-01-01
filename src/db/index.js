import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);//this is tell whole url where mongodb connection happens
    //this is to check if we by mistake we connect to difft url than production and get to know on which connection we are connecting
  } catch (error) {
    console.log("MONGODB connection failed ", error);//these logs are very impotant to see where i m doing the errors
    process.exit(1);
    // process.exit(code)
    // -> Immediately stops the Node.js process
    // -> Exit code convention:
    //    0 = success (program finished correctly)
    //    1 = failure (program crashed or critical error)
    // -> Often used in scripts, CI/CD, or when app cannot recover
  }
};
export default connectDB;