var express = require('express');

var uniqid = require('uniqid');

var path = require('path');

var media = require('../promises/prmMedia');

var router = express.Router();

router.get('/',(req,res,next)=>{
    const uid = '1234';
    const filename = req.query.filename;

    
    if(uid && filename){
        const ext = path.extname(filename);

        const imageextensions = ['.jpg','.jpeg','.png'];
        const videoextensions = ['.mp4'];

        if(imageextensions.includes(ext) || videoextensions.includes(ext)){
            (
                async ()=>{
                    try{
                        const mediaid = uniqid();
                        const mediaurl = uniqid()+ext;
                        let mediatype = 'image';

                        if(videoextensions.includes(ext)){
                            mediatype = 'video';
                        }
                        await media.insertMedia(mediaid,mediaurl,mediatype);

                        res.send(Object.assign({},await media.getURL(mediaurl,mediatype,ext),{id:mediaid}));
                    }catch(e){
                        console.log(e)
                        res.status(500).json({msg:"Something Went Wrong"});
                    }
                    
                }
            )()    
        }else{
            res.status(500).json({msg:"Something Went Wrong"});
        }

        
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
})

module.exports = router;