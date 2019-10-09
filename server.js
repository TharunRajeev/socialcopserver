(
    async ()=>{

        try{
            var mongo = require('./promises/connection');

            await mongo.connect();

            var express = require('express');

            var app = express();

            app.use(express.json());
            app.use(express.urlencoded());

            var post = require('./routes/post');

            app.use('/post',post);

            var upload = require('./routes/upload');

            app.use('/upload',upload);
            
            var user = require('./routes/user');

            app.use('/user',user);

            await app.listen(2500);
            
            console.log("SERVER STARTED");
        }catch(e){
            console.log(e);
            console.log("Cant Start Server");
        }
        
        
    }
)();