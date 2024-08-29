import { app } from './app.js';
import 'dotenv/config'
import { dbConnect } from "../db/datab.js";
import { storage } from '../middleware/multer.middleware.js';
import { var1, var2 } from '../controllers/user.controller.js';
import { try1 } from '../middleware/auth.middleware.js';

//const port_num = process.env.PORT || 8003;

dbConnect()
.then(()=>{
    app.get("/", (req,res)=>{
        res.send("Hey");

    })
    app.listen( process.env.PORT || 5000 ,()=>{
        console.log(`Server is and running  ${try1} ${var1} ${var2}`, process.env.PORT,"also");
    })
    

})
.catch((e)=>{
    console.log(`Db connection or ${e}`)
});