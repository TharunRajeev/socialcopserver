var mongo = require('./connection');

var db = mongo.get();

module.exports = {

    getUser : ({uid,username,email})=>{
        return new Promise((resolve,reject)=>{

            const temp = {uid:uid,username:username,email:email}

            var query = {};
            for(key in temp){
                const value = temp[key];
                if(value){
                    query[key] = value;
                }
            }

            db.collection("users").findOne(query,(err,result)=>{
                if(err){
                    reject();
                }else{  
                    resolve(result);
                }

            })
        })


    }


}