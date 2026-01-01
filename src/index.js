// require('dotenv').config({path:'./env'});//here this require statment is not consistent with type:module[it will not give error but then also it not look good]
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path:'./.env'
})


connectDB();






















// import e from "express";
// const app = e();
// (async ()=>{
//     try {
//    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     //    app.on("error", handler) is used to catch and respond to low-level errors in your Express app — especially those not handled by middleware or routes. It’s a safety net for unexpected failures.
//        app.on("error",(error)=>{
//         console.log("ERR: ",error);
//         throw error;
//        })

//        app.listen(process.env.PORT);

//     } catch (error) {
//         console.error("ERROR: ",error);
//         throw error;
//     }
// })();

// the above one is basic approach =>

