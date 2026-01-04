import mongoose ,{Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        typeof:Schema.Types.ObjectId,//one who is subscribing
        ref:"User",
    },
    channel:{
        typeof:Schema.Types.ObjectId,//one whose channel is being subscribed to
        ref:"User",
    },


}, {timestamps:true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema); 