var express = require("express");

var bcrypt = require("bcrypt");
var uniqid = require("uniqid");

var auth = require("../promises/prmAuth");
var redis = require("../promises/prmRedis");
var jwt = require("../promises/prmJWT");


var router = express.Router();


router.get("/check_username",(req,res)=>{
    const username = req.query.username;

    if(username){
        (
            async ()=>{
                try{
                    if(await auth.usernameExists(username)){
                        res.json({exists:true});
                    }else{
                        res.json({exists:false});
                    }
                }catch(e){
                    res.status(500).json({msg:e});
                }
                
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
})


router.get("/check_email",(req,res)=>{
    const email = req.query.email;

    if(email){
        (
            async ()=>{
                try{
                    if(await auth.emailExists(email)){
                        res.json({exists:true});
                    }else{
                        res.json({exists:false});
                    }
                }catch(e){
                    res.status(500).json({msg:e});
                }
                
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
})


router.post('/register',(req,res)=>{

    //TODO : FIX CANNOT SENT HEADERS ONCE SENT ERROR
    const data = req.body;
    console.log(data);
    //TODO: ADD SANITIZATION CHECK
    if(data.firstname && data.lastname && data.email && data.username && data.password && data.verificationCode  ){
        (
            async ()=>{

                try{
                    
                    if(!await auth.emailExists(data.email)){
                        if(!await auth.usernameExists(data.username)){
                            //TODO:ADD EXPIRY TO CODE 
                            const code = await redis.getVerificationCode(data.email);
                            console.log(code);
                            if(parseInt(data.verificationCode) == code){
                                const password = await bcrypt.hash(data.password,10);
                                await redis.removeVerificationCode(data.email);        
                                await auth.registerUser({uid:uniqid(),firstname:data.firstname,lastname:data.lastname,email:data.email,username:data.username,password:password,gender:data.gender,passwordChangedAt:new Date().getTime(),registeredAt:new Date().getTime()});

                                res.json({msg:"Success",code:200})
                                
                                
                            }else{
                                res.json({msg:"Invalid Code",code:400});
                                
                            }
                            
                        }else{
                            res.json({msg:"Username Already Exists",code:401});
                            
                        } 
                    }else{
                        res.json({msg:"Email Already Exists",code:402})
  
                    }
                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:"Something Went Wrong" ,code:500})
  
                }
                
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
        
    }
})

router.get('/verification_code',(req,res)=>{
    const email = req.query.email;
    if(email){
        (
            async ()=>{
                try{
                    
                    if(!await auth.emailExists(email)){
                        const code = Math.floor(100000 + Math.random() * 900000);
                        console.log(code);

                        await redis.updateVerificationCode(email,code);
                        //TODO: ADD EXPIRY CHECK
                        
                        //await auth.sendVerificationCode(email,code);
                        
                        res.json({msg:"Success"});
                    }else{
                        throw new Error("Something Went Wrong");
                    }
                    
                
                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:e});
                }
                
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
    
});

router.post('/login',(req,res,next)=>{
    const data = req.body;
    if(data.email && data.password){
        (
            async ()=>{
                try{
                    
                    const user = await auth.getUser(data.email);
                    console.log(user)
                    if(await bcrypt.compare(data.password,user.password)){
                        const refreshtoken = "awdwad";
                        const jsontoken = await jwt.getToken(user.uid);
                        await redis.addRefreshToken(user.uid,refreshtoken);
                        
                        res.cookie("token",jsontoken,{expires:new Date(Date.now() + 24*60*60*1000),httpOnly:true});
                        res.json({msg:"Success",code:200,refreshtoken:refreshtoken});
                        next();
                    }else{
                        res.json({msg:"Wrong Password",code:400})
                    }
                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:"Something Went Wrong"});
                    next();
                }
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
        next();
    }
});

router.post('/token',(req,res,next)=>{
    const refreshtoken = req.body.refreshtoken;
    if(refreshtoken){
        (
            async ()=>{
                try{
                    const uid = await redis.getUIDFromRefreshToken(refreshtoken);
                    const token = await jwt.getToken(uid);
                    res.cookie("token",token,{expire:new Date().getTime()+48*60*60*1000,httpOnly:true});  
                    res.json({code:200,msg:"Success"});
                    
                }catch(e){
                    res.status(500).json({code:500,msg:"Something Went Wrong"});
                    next();
                }
            }
        )();
        
    }else{
        res.status(500).json({code:500,msg:"Something Went Wrong"});
    }
    
})

router.get('/change_password',(req,res)=>{
    //TODO : ADD AUTH MIDDLEWARE
    if(req.body.password && req.body.newpassword){
        (
            async ()=>{
                try{
                    
                    const user = await auth.getUser(uid);
                    if(user.password === req.body.password){
                        await auth.updatePassword(uid,password);
                        res.json({msg:"Password Changed",code:200});
                    }else{
                        throw new Error("Invalid Password")
                    }

                }catch(e){
                    res.json({msg:"Wrong Password",code:400});
                }
                
            }

        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
});

router.get('/reset_code',(req,res,next)=>{
    const email = req.query.email;
    if(email){
        (
            async ()=>{
                try{
                    
                    if(await auth.emailExists(email)){
                        const code = Math.floor(100000 + Math.random() * 900000);
                        //TODO:ADD EXPIRY CHECK
                        await redis.addResetCode(email,code)
                        await auth.sendResetCode(email,code);
                        res.json({msg:"Reset Code Sent" , code : 200});
                        next();
                    }else{
                        res.json({msg:"Email Id Does not exist" , code : 400});
                        next();
                    }
                }catch(e){
                    res.status(500).json({msg:e});
                    next();
                }
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
        next();
    }
});

router.post('/reset_password',(req,res,next)=>{
    const data = req.body;
    if(data.code && data.email && data.password){
        (
            async ()=>{
                try{
                    
                    if(await auth.emailExists(data.email)){
                        const resetcode = await redis.getResetCode(data.email);
                        if(data.code === resetcode){
                            await redis.removeResetCode(data.email);
                            await auth.updatePassword(data.email,data.password);
                            res.json({msg:"Password Reset",code:200});
                            next();
                        }else{
                            res.json({msg:"Invalid Code",code:400})
                            next();
                        }    
                    }else{
                        res.json({msg:"Email Id doesnot exist",code:401});
                        next();
                    }
                    
                }catch(e){
                    res.status(500).json({msg:"Something Went Wrong"});
                    next();
                }
                
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
})

router.get('/logout',(req,res)=>{
    
    try{
        
        const uid = res.locals.uid;
        redis.addInvalidToken(uid,req.cookies.token);
        req.cookie("token","",{expires:new Date().now(),httpOnly:true});

    }catch(e){

        res.status(500).send({msg:"Something Went Wrong"});

    }
    
    
});


module.exports = router;