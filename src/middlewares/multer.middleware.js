import multer from "multer";


export const storage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null , './public/temp')
    },
    filename:function(req,file,cb){
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})


export const upload = multer({
    storage , 
    limits : {
        fileSize : 5*1000*1000
    }
})