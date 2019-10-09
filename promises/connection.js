var db = null;
module.exports = {
    connect : ()=>{
        return new Promise((resolve,reject)=>{
            const MongoClient = require('mongodb').MongoClient;
            const uri    = "mongodb+srv://clientUser:tomatopotato@cluster0-4itah.mongodb.net/admin?retryWrites=true&w=majority";
            const client = new MongoClient(uri, { useNewUrlParser: true });
            client.connect(err => {
                if(err){
                    reject();
                }else{
                    db = client.db("sociocop");
                    resolve();
                }
                
            });
        })
    },
    get : ()=>{
        return db;
    }


}