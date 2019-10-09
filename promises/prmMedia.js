var mongo = require('./connection');

var db = mongo.get();

var AWS = require('aws-sdk');

var privateKey = 
`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArRjtq9L0v/98pVPzbSfcSXx07GPPdAa4IFu+LZN8g1IxF0w2
ZqEwa3dekMUc3M0QTLDU6qhYQNpp9gj4wxL9dfd0PiPv8VRWdgPYAB4nEp1h7W8A
PjyT/VCXedUndxX/yuBKKzhSe0s6Wxg/7P95iWSr69XVvRyfZJyfIhwUYsP//eUq
Raw4Nre3cHZB2O2OfBWw7y4homPeEFHNEK3ooXXCpo9K+09bQw5OxG68TN3C1oeM
ySlcuZ6wH2t95E1H/3y78lFk9+DCiWWzj1TaewZXVUyjulwKtKIY5u7FqihSBetl
FcnWBguXKQooF1pr3fDWtl/yoe7Nat/b80RC+QIDAQABAoIBADgtD+0kkIPDEZvC
LA0v04ER4AxbtBbum1D9FTJLXCxuPzpVZI5YH5Ow8MLBBcXu0yxgcykYq1OYzqyn
arw8bH+daF9GYHeMrGauhqo7HukepIpe7NBF7q1WO2Kxt5YhUJtxwQBXzgTvfCfW
LeDnZHUfc+AczLoMEPqhDdAPFtqaQZ8uYGG/Dw8QG+c3L1QfYBW2oRFe62K2m0gg
BTn0jsuN8D7APgTKX/CfXKsRZNAfpwQSyS2OxeIdA4KRBoQuKJCJTRELShbdMgFR
YWvsyOe0GkEWOO7wYC7lW51hLTtBAHogp+22lohi/Yto12ogf65MzA84X9762qTL
YbrJOYUCgYEA8Ia0d6JK9vAs5mRhiHSj9gZMk3jnv8Qlq3zZg38XeDWggQonDetj
cRy5jqXWIlLFWnH5j4WHJHoR+2HuK+8ImoPQi0w4A7LewNs/dn0uIOmP9Gh2QyEe
Q79r7n2ZPYgrlLfWNL5suzgQfZ/zkoXtzSRQy/Zsd6M1TooBoYpRPDcCgYEAuDu4
CghDSXVyGC2ESDXziJVJvNKU2Y++CP5uzG14JZQDbhCTXgqPhvuTEidbl0ZKojHD
jD0+NG8hXvBAj1c5O/Xd4XIiWGvJDWjT46x0QLGfkzyPYxN9ggXQrnb/cNlxEtJD
hySBDd2rfhT4K69lTeRJv9wZSQ1aHMyAmoF3wk8CgYA6rlKXIWQyrNP3faQB+5sI
6e6CyCuaMIuUNAiJOVeLf2HiOYzfq37+WKi4saL1isYVU9sz9brL3nBGqVTHKTEr
KV+WrIi59ki8OoFYMiAv7WuukFHR/OF6W9hEPiZFydQAG33KLm8umfYEACMXq08i
Dmsb58n8wje+KpNNSwaYrwKBgQC36x46Ha+WmQGSs3XYZMu/MVHQh+UDIGWVMvNH
b40+7nlSGogTnLVWCrXyrInaBdkh/E38JXOBAuQsk+nPb0L64eNkWf2BifDHSzwk
kJfpsajdYtq+DMoB0G5YjQFLFje0k2XIdx/CyOWX07VAXzPhw6IAP+iaLhMkpt9H
3zHALwKBgENrKwB2JHB0W5boTwR/sutnlyObalsPU+EPWWvB9kHBUHIspgqCnjtv
a1yebsq1WgweOwDflFpZSeyehhXVYJChIVoYymQ7FwO9fS7H5QTVvpBTsJQHDYz7
mdiGqO+J9NI2BhnF4SuDJ1llXyWhuf4JRDIpF1OVjoH3d5g91EJ3
-----END RSA PRIVATE KEY-----`



AWS.config.region = 'ap-south-1';

const cloudfrontSigner = new AWS.CloudFront.Signer('APKAJU6ZWFILTOIPNN2Q',privateKey);


const s3 = new AWS.S3({accessKeyId:'AKIAUY33RPVPDPGQLMTS',secretAccessKey:'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',signatureVersion:'v4'});


module.exports = {

    getURL : (key,mediatype,mediaext)=>{
        return new Promise((resolve,reject)=>{
            const params={
                Bucket:'media-radness',
                Fields:{
                    key:key,
                    'Content-Disposition' : 'inline',
                    'Content-Type' : mediatype+"/"+mediaext.split(".")[1]
                },
                Conditions:[
                        //["content-length-range",1, 10485760]
                ]
            }

            s3.createPresignedPost(params,(err,data)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(data);
                }
            })
        })
    },
    getSignedUrl : (url)=>{
        return new Promise((resolve,reject)=>{
            cloudfrontSigner.getSignedUrl({url : "https://d23cporqi799f0.cloudfront.net/"+url,expires:Date.now()+5*60*1000},(err,url)=>{
                if(err){
                    reject()
                }else{
                    resolve(url);
                }
            })
        })
    },   
    insertMedia : (id,url,type)=>{
        return new Promise((resolve,reject)=>{
            db.collection("media").insertOne({id:id,url:url,type:type},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve();
                }
            })
        })
    },
    getMedia : (id)=>{
        return new Promise((resolve,reject)=>{
            db.collection("media").findOne({id:id},(err,result)=>{
                if(err){
                    reject();
                }else{
                    resolve(result);
                }
            })
        })
    }

}