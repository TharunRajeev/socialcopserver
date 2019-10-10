(
    async ()=>{

        try{
            var mongo = require('./promises/connection');

            await mongo.connect();

            var express = require('express');

            var app = express();

            
            app.use(express.json());
            app.use(express.urlencoded());

            var cookieParser = require('cookie-parser');

            app.use(cookieParser());

            var authMiddleware = require('./middlewares/authMiddleware');


            

            var post = require('./routes/post');

            app.use('/post',post);

            var upload = require('./routes/upload');

            app.use('/upload',authMiddleware.verifyUser,upload);
            
            var user = require('./routes/user');

            app.use('/user',authMiddleware.verifyUser,user);

            var auth = require('./routes/auth');

            app.use('/auth',auth);

            await app.listen(2500);
            
            console.log("SERVER STARTED");
        }catch(e){
            console.log(e);
            console.log("Cant Start Server");
        }
        
        
    }
)();