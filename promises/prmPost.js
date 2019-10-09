var mongo = require('./connection');

var db = mongo.get();

module.exports = {

    getPosts : ({parentid,uid,type="post",status,accepted})=>{
        return new Promise((resolve,reject)=>{
            var temp = {parentid,uid,type,status,accepted};
            var query = {};
            for(key in temp){
                const value = temp[key];
                if(value){
                    query[key] = value;
                }
            }

            db.collection("posts").find(query).toArray((err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve(result);
                }
            })
        })
    },
    insertPost : ({parentid=null,pid,uid,description,image,category,location,type,status=null,createdAt})=>{
        return new Promise((resolve,reject)=>{
            db.collection("posts").insertOne({parentid:parentid,pid:pid,uid,uid,description:description,image:image,category:category,location:location,type:type,status,createdAt:createdAt},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve();
                }
            })
        })
    },
    getPost : (pid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("posts").findOne({pid:pid},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve(result);
                }
            })
        })
    },
    updatePost : (pid,{status,accepted})=>{
        return new Promise((resolve,reject)=>{

            var temp = {status,accepted};
            var query = {};
            for(key in temp){
                const value = temp[key];
                if(value){
                    query[key] = value;
                }
            }

            console.log(query)

            db.collection("posts").updateOne({pid:pid},{$set:query},(err,result)=>{
                if(err){
                    console.log(err)
                    reject();
                }else{
                    resolve();
                }
            })
        })
    },
    isupVoted  : (pid,uid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("upvotes").findOne({pid:pid,uid:uid},(err,result)=>{
                if(err){
                    reject();
                }else{
                    if(result){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                    
                }
            })
        })
        
    },
    isplusOned : (pid,uid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("plusones").findOne({pid:pid,uid:uid},(err,result)=>{
                if(err){
                    reject();
                }else{
                    if(result){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                    
                }
            })
        })
        
    },

    upvote : (pid,uid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("upvotes").insertOne({pid:pid,uid:uid},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve();
                }
            })
        })
    },
    plusone: (pid,uid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("plusones").insertOne({pid:pid,uid:uid},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve();
                }
            })
        })
        
    },
    unVote : (pid,uid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("upvotes").deleteOne({pid:pid,uid:uid},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve();
                }
            })
        })
        
    },
    unplusone : (pid,uid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("plusones").deleteOne({pid:pid,uid:uid},(err,result)=>{
                if(err){
                    reject();
                }else
                resolve();
            })
        })
        
    },
    getUpVotes : (pid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("upvotes").count({pid:pid},(err,count)=>{
                if(err){
                    reject();
                }else{
                    resolve(count);
                }
            })
        })
    },
    getPlusOnes : (pid)=>{
        return new Promise((resolve,reject)=>{
            db.collection("plusones").count({pid:pid},(err,count)=>{
                if(err){
                    reject();
                }else{
                    resolve(count);
                }
            })
        })
    }


}