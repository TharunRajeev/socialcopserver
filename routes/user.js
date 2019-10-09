var express = require('express');

var router = express.Router();

var user = require('../promises/prmUser');


router.get('/',(req,res)=>{
    const username = req.query.username;
    if(username){
        (
            async ()=>{
                try{

                    const currentUser = await user.getUser({username:username});
                    res.send({name:currentUser.firstname+" " + currentUser.lastname,username:currentUser.username,profile:currentUser.profile});

                }catch(e){
                    res.status(500).json({msg:"Something Went Wrong"});
                }


            }

        )();
        
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }

})



module.exports = router;