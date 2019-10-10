var mongo = require("../promises/connection");
var auth = require("../promises/prmAuth");
var jwt = require("../promises/prmJWT");
var redis = require("../promises/prmRedis");


module.exports = {
    verifyUser : (req,res,next)=>{
        const token = req.cookies.token;

        if(token){
            (
                async ()=>{
                    try{
                        //TODO: ADD TOKEN EXPIRED REFERSH TOKEN 
                        const decoded = await jwt.verifyToken(token);
                        const invalidTokens = await redis.getInvalidTokens(token);
                        if(!invalidTokens.includes(token)){
                            const db = await mongo.connect();
                            const user = await auth.getUser(decoded.uid);
                            if(user.passwordChangedAt < decoded.iat*1000){
                                res.locals.uid = decoded.uid;
                                next();
                            }else{
                                throw new Error("Invalid Login");
                            }
                            
                        }else{
                            throw new Error("Something Went Wrong");
                        }
                    }catch(e){
                        console.log(e);
                        let message = "Something Went Wrong";
                        let code = 500;
                        if(e === "TOKEN_EXPIRED"){
                            message = "Token Expired";
                            code = 401;
                        }
                        res.status(500).json({msg:message,code:code})
                        
                    }
                }
            )();
        }else{
            res.status(500).json({msg:"Something Went Wrong"});
        }
    }


}