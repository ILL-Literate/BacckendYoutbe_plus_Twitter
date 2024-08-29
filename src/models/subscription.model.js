import moongose, {schema} from "moongose"
import { User } from "./user.model"
const subscriptionSchema = new schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref : "User"
    },
    

},{timestamps: true})


export const  Subscription = moongose.model("Subscription", subscriptionSchema) 