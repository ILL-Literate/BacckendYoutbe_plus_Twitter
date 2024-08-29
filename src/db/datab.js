import mongoose from "mongoose"
import 'dotenv/config'
import {database_name} from "../utils/constants.js"
const dbConnect = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODBURL}${database_name}`);
        console.log("Db connected host id:", connectionInstance.connection.host)

    }
    catch(error){
        console.log(`Connection failed ${error}`);
        process.exit(1);

    }
}
export {dbConnect}

