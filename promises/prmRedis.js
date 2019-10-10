const redis = require("redis");
var client = redis.createClient();

/**
 * Redis Database:
 * 0 ---> Verification Codes 
 * 1 ---> Refresh Tokens
 * 2 ---> Invalide JWT
 * 3 ---> Reset Codes
 */

module.exports = {
    addRefreshToken : (uid,token)=>{
        return new Promise((resolve,reject)=>{
            client.select(1,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.set(token,uid,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong");
                        }else{
                            resolve(reply);
                        }
                    });
                }
            })
        })
    },
    getUIDFromRefreshToken : (refreshToken)=>{
        return new Promise((resolve,reject)=>{
            client.select(1,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.get(refreshToken,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong");
                        }else{
                            resolve(reply);
                        }
                    });
                }
            })
        })
    },
    getRefreshTokens : (uid)=>{
        return new Promise((resolve,reject)=>{
            client.select(1,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.smembers(uid,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong");
                        }else{
                            resolve(reply);
                        }
                    });
                }
            })
        })
    },
    updateVerificationCode : (email,verificationCode)=>{
        return new Promise((resolve,reject)=>{
            client.select(0,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    //TODO :ADD EXPIRY CODE
                    client.set(email,verificationCode,(err,res)=>{
                        if(err){
                            console.log(err);
                            reject("Something Went Wrong");
                        }else{
                            resolve(true);
                        }
                    })        
                }
            })
            
        })
    },
    getVerificationCode : (email)=>{
        //TODO: ADD EXPIRY 
        return new Promise((resolve,reject)=>{
            client.select(0,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.get(email,(err,res)=>{
                        if(err){
                            reject("Something Went Wrong")
                        }else{
                            resolve(res);
                        }
                    })
                }
            })
            
        })
    },
    removeVerificationCode : (email)=>{
        return new Promise((resolve,reject)=>{
            client.select(0,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.del(email,(err,res)=>{
                        if(err){
                            reject("Something Went Wrong")
                        }else{
                            resolve();
                        }
                    })
                }
            })
        })
        
    },
    addInvalidToken : (uid,token)=>{
        return new Promise((resolve,reject)=>{
            client.select(2,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.sadd(uid,token,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong")
                        }else{
                            resolve(reply);
                        }
                    })
                }
            })
        })
    },
    getInvalidTokens : (uid)=>{
        return new Promise((resolve,reject)=>{
            client.select(2,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.smembers(uid,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong")
                        }else{
                            resolve(reply);
                        }
                    })
                }
            })
        })
    },
    addResetCode  : (email,code)=>{
        return new Promise((resolve,reject)=>{
            client.select(3,(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    client.set(email,code,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong");
                        }else{
                            resolve(true);
                            
                        }
                    })
                }
            })
        })
        
    },
    getResetCode : (email)=>{
        return new Promise((resolve,reject)=>{
            client.select(3,(err,result)=>{
                if(err){
                    reject("Something Went Wrong");
                }else{
                    client.get(email,(err,result)=>{
                        if(err){
                            reject("Something Went Wrong");
                        }else{
                            resolve(result);
                        }
                        
                    })
                    
                }
            })
        })
    },
    removeResetCode : (email)=>{
        return new Promise((resolve,reject)=>{
            client.select(3,(err,result)=>{
                if(err){
                    reject("Something Went Wrong");
                }else{
                    client.del(email,(err,reply)=>{
                        if(err){
                            reject("Something Went Wrong")
                        }else{
                            resolve();
                        }
                    })
                }
            })
        })
    }
}