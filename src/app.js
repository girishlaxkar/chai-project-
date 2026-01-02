import e from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = e();
app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(e.json({limit:"16kb"}))// - The limit option sets the maximum size of the request body that Express will accept and parse.
app.use(e.urlencoded({extended:true,limit:"16kb"}));
app.use(e.static("public"));
app.use(cookieParser());

//routrs import =>
import userRoutes from "./routes/user.routes.js";

//routes declarartion =
app.use("/api/v1/users",userRoutes); 

export { app };