var jwt = require("jsonwebtoken");

module.exports = {
    getToken : (uid)=>{
        return new Promise((resolve,reject)=>{
            jwt.sign({uid:uid},"hello",{algorithm:"HS256",expiresIn:'1d'},(err,token)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    resolve(token);
                }
            })
        })
    },
    verifyToken : (token)=>{
        return new Promise((resolve,reject)=>{
            jwt.verify(token,"hello",{algorithms:["HS256"]},(err,result)=>{
                if(err){
                    if(err.name === 'TokenExpiredError'){
                        reject("TOKEN_EXPIRED")
                    }else{
                        reject("Invalid Login")
                    }
                    
                }else{
                    resolve(result);
                }
            })
        })
    }

}