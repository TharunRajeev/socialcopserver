var mongo = require('./connection');

const db = mongo.get();

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host:"smtp.ethereal.email",
    port:"587",
    secure:false,
    auth:{
        user:"nicholas.parisian@ethereal.email",
        pass:"rR21FFnfA1WyXVbJaG"
    }
})

module.exports = {
    getUser : (username)=>{
        return new Promise((resolve,reject)=>{
            db.collection("users").findOne({$or:[{username:username},{email:username},{uid:username}]},{fields:{_id:0}},(err,result)=>{
                if(err || !result){
                    reject("User Doesnot Exists");
                }else{
                    resolve(result);
                }
            })
        })
    },
    emailExists : (email)=>{
        return new Promise((resolve,reject)=>{
            db.collection("users").findOne({email:email},(err,result)=>{
                if(err){
                    reject("Something Went Wrong");
                }else{
                    if(!result){
                        resolve(false);
                    }else{
                        resolve(true);
                    }
                }
            })
        })
    },
    usernameExists  : (username)=>{
        return new Promise((resolve,reject)=>{
            db.collection("users").findOne({username:username},(err,result)=>{
                if(err){
                    reject("Something Went Wrong");
                }else{
                    if(!result){
                        resolve(false);
                    }else{
                        resolve(true);
                    }
                    
                }
            })
        })
    },
    registerUser : (user)=>{
        return new Promise((resolve,reject)=>{
            db.collection("users").insertOne(user,(err,result)=>{
                if(err || !result){
                    reject("Something Went Wrong");
                }else{
                    resolve();
                }
            })
        })
    },
    sendVerificationCode : (email,verificationCode)=>{
        return new Promise((resolve,reject)=>{
            const mailOptions = {
                from : '"Fred Foo" <foo@example.com>',
                to : email,
                subject : "Your VO-ISE Verification Code",
                text : "Verify Your Email Address",
                html : "<h1>"+verificationCode+"</h1>"
            }
            transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err)
                    reject("Something Went Wrong")
                }else{
                    resolve(true);
                }
            })
        })  
    },
    sendResetCode : (email,resetCode)=>{
        return new Promise((resolve,reject)=>{
            const mailOptions = {
                from : '"Fred Foo" <foo@example.com>',
                to : email,
                subject : "Your VO-ISE Password Reset Code",
                text : "Your Password Reset Code",
                html : "<h1>"+resetCode+"</h1>"
            }
            transporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err)
                    reject("Something Went Wrong")
                }else{
                    resolve(true);
                }
            })
        })  
    },
    updatePassword : (email,password)=>{
        return new Promise((resolve,reject)=>{
            db.collection("users").updateOne({email:email},{$set:{password:password,passwordChangedAt:new Date().getTime()}},(err,result)=>{
                if(err){
                    reject("Something Went Wrong")
                }else{
                    resolve(true);
                }
            })
        })
    }


}