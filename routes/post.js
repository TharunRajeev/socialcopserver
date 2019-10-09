var express = require('express');

var router = express.Router();

var post = require('../promises/prmPost');
var user = require('../promises/prmUser');

var media = require('../promises/prmMedia');



var uniqid = require('uniqid');

router.post('/',(req,res)=>{
    console.log("hey")

    const uid = '1234';

    const image = req.body.image;
    const description = req.body.description;
    const category = req.body.category;
    const location = req.body.location;
    const type = req.body.type;


    const parentid = req.body.parentid;

    if(uid && description && ['post','request','comment'].includes(type)){
        (
            async ()=>{
                try{
                    var currentPost = {parentid:parentid,pid:uniqid(),uid:uid,category:category,description:description,image:image,location:location,type:type,createdAt:Date.now()}
                    if(parentid && type === 'request'){
                        currentPost.accepted = false;
                    }else{
                        currentPost.status = -1;
                    }

                    await post.insertPost(currentPost);
                      
                    console.log("done")
                    res.json({msg:"Success"});

                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:"Something Went Wrong"});
                }

            }
        )();


    }else{
        console.log("Something Went Wrong");
        res.status(500).json({msg:"Error Something Went Wrong"});
    }


});


router.get('/',(req,res)=>{
    const uid = '1234';
    const pid = req.query.pid;

    if(uid && pid){
        (
            async ()=>{
                try{
                    var currentPost = await post.getPost(pid);

                    var postUser = await user.getUser({uid:uid});

                    res.send({parentid:currentPost.parentid,pid:currentPost.pid,user:{username:postUser.username,name:postUser.firstname + " " + postUser.lastname,username:postUser.username,profile:postUser.profile},description:currentPost.description,image:(currentPost.image)?await media.getSignedUrl((await media.getMedia(currentPost.image)).url):null,location:currentPost.location,category:currentPost.category,status:currentPost.status,accepted:currentPost.accepted,type:currentPost.type,plusones:await post.getPlusOnes(currentPost.pid),plusoned:await post.isplusOned(currentPost.pid,uid),upvotes:await post.getUpVotes(currentPost.pid),upvoted:await post.isupVoted(currentPost.pid,uid),comments:[],createdAt:currentPost.createdAt});

                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:"Something Went Wrong"});
                }
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
})


router.get('/posts',(req,res)=>{
    const uid='1234';

    const parentid = req.query.parentid;
    const quid = req.query.quid;
    const type = req.query.type;
    const status = req.query.status;
    const accepted = req.query.accepted;
    
    if(uid){
        (
            async ()=>{
                try{
                    
                    const posts = await post.getPosts({parentid:parentid,uid:quid,type:type,status:status,accepted:accepted});

                    var processedPosts = [];

                    for(var i=0;i<posts.length;i++){
                        const currentPost = posts[i];

                        const postUser = await user.getUser({uid:uid});

                        processedPosts.push({parentid:currentPost.parentid,pid:currentPost.pid,user:{username:postUser.username,name:postUser.firstname + " " + postUser.lastname,username:postUser.username,profile:postUser.profile},description:currentPost.description,image:(currentPost.image)?await media.getSignedUrl((await media.getMedia(currentPost.image)).url):null,location:currentPost.location,category:currentPost.category,status:currentPost.status,accpepted:currentPost.accepted,type:currentPost.type,plusones:await post.getPlusOnes(currentPost.pid),plusoned:await post.isplusOned(currentPost.pid,uid),upvotes:await post.getUpVotes(currentPost.pid),upvoted:await post.isupVoted(currentPost.pid,uid),comments:[],createdAt:currentPost.createdAt})

                    }
                    

                    res.send(processedPosts);
                    
                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:"Something Went Wrong"});
                }
            }
        )();

    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }
})


router.get('/resolve',(req,res)=>{
    const uid = '1234';
    const parentid = req.query.parentid;
    const pid = req.query.pid;

    if(parentid && pid && uid){
        (
            async ()=>{
                try{
                    const currentPost = await post.getPost(parentid);
                    
                    if(currentPost.uid == uid && currentPost.status == -1){

                        await post.updatePost(parentid,{status:1});
                        await post.updatePost(pid,{accepted:true});

                        res.json({msg:"Success"});

                    }else{
                        res.status(500).json({msg:"Something Went Wrong"});
                    }

                }catch(e){
                    console.log(e);
                    res.status(500).json({msg:"Something Went Wrong"});
                }
            }
        )();

    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }


})


router.get('/upvote',(req,res)=>{
    const uid = '1234';

    const pid = req.query.pid;

    

    if(uid && pid){
        (   
            async ()=>{
                try{
                    if(!(await post.isupVoted(pid,uid))){
                        await post.upvote(pid,uid);
                    }else{
                        await post.unVote(pid,uid);
                    }

                    res.json({msg:"Success"});
                }catch(e){
                    res.status(500).json({msg:"Something Went Wrong"});
                }
            }
        )();
    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }

})

router.get('/plusone',(req,res)=>{
    const uid = '1234';
    const pid = req.query.pid;

    if(uid && pid){
        (
            async ()=>{
                try{
                    if(!(await post.isplusOned(pid,uid))){
                        await post.plusone(pid,uid);
                    }else{
                        await post.unplusone(pid,uid);
                    }
                    res.json({msg:"Success"});
                }catch(e){
                    res.status(500).json({msg:"Something Went Wrong"});
                }
            }
        )();

    }else{
        res.status(500).json({msg:"Something Went Wrong"});
    }


});

router.delete('/',(req,res)=>{

    const uid = '1234';
    const pid = req.query.pid;

    if(pid && uid){

        (
            async ()=>{
                try{
                    const currentPost = await post.getPost(pid);

                    if(currentPost.uid == uid){

                        await post.deletePost(pid);

                        res.json({msg:"Success"});
                    }else{
                        res.status(500).json({msg:"Something Went Wrong"});
                    }

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