import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import "dotenv/config"
import jwt from "jsonwebtoken"

const userSchema =  new Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        index: true// serachabele and optimizable 
    }, 
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },
    fullName:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: true
    },
    refreshToken:{
        type: String
    }


},{
    timestamps: true

})
 userSchema.pre("save", async function (next){// the pre hook will help us to encrypt the password before saving
    if(!this.isModified("password")) next()
    this.password = await bcrypt.hash(this.password,11)
    next()
 })
//password is correct or not 
userSchema.methods.isPassCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
//returns true or false

}
userSchema.methods.genAcessToken = async function(){
    return jwt.sign({
        _id: this._id,
        userName: this.userName,
        email: this.email
    },
    process.env.ACESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.genRefreshToken = async function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}




export const User = mongoose.model("User", userSchema)