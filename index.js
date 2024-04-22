import express from "express"
import detection from "./utils/detection.js"
import multer from "multer"

const app=express()

const diskStorage=multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null, "./public/uploads")
      },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
const upload=multer({
 storage:diskStorage
})

app.post("/detectSign",upload.single("signImage"),async(req,res,next)=>{
    console.log("file",req.file)

    const result=await detection.detect_sign(req.file.originalname)

    res.json(result)
})

const port =process.env.port || 3000

app.listen (port,(err)=>{
    if(err){
        console.log("err: ",err)

    }

    console.log(`server is listening on localhost:${port}`)
})