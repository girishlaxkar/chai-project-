import mongoose ,  {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';

const userSch = new Schema (
    {
        username :{
            type:String,
            required:true,
            unique:true,
            lowercase :true,
            trim:true,
            index:true//HERE IT IS TRUE AS WE WANT TO SEARCH USER BY USERNAME FREQUENTLY SO IT WILL MAKE SEARCHING FASTER
            
        },
        email :{
            type:String,
            required:true,
            unique:true,
            lowercase :true,
            trim:true,
        },
        fullname :{
            type:String,
            required:true,
            trim:true,
            index :true
        },
        avatar:{
            type:String,//cloudinry url
            required:true
        },
        coverImage:{
            type:String
        },
        warchHistory:[//bydeafult empty jse jse user dekhega videos wo add hote jayenge
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,'Password is required']
        },
        refreshToken:{
            type:String
        }

    },
    {
        timestamps:true
    }
)

//  That pre("save") hook is a Mongoose middleware that runs automatically before a document is saved to the database.
// This pre‑save hook ensures every user’s password is securely converted into a hash before being saved in MongoDB.

userSch.pre("save",async function () {
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10);
})

// - userSch.methods → This is how you add custom instance methods 
// to a Mongoose schema. Every document created from this schema will
//  have this method available.

userSch.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password,this.password);
}


userSch.methods.generateAccessToken =  function () {
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
)
}

//our refresh token also have same but it have less info as it refreshes again nd again so we have only id in it
userSch.methods.generateRefreshToken =  function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
)
}

export const User = mongoose.model("User",userSch)
