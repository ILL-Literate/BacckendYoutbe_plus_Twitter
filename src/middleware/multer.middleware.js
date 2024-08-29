// import multer from "multer"
// import fs from "fs"

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./Public/Temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
 //export  const upload = multer({ storage })

 import multer from "multer";

 const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, "./public/temp")
     },
     filename: function (req, file, cb) {
       
       cb(null, file.originalname)
     }
   })

 export const upload = multer({ 
     storage, 
 })

 export {storage}