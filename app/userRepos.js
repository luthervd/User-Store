var Promise = require('bluebird');
var MongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

class UserRepos{
    constructor(config){
        this.config = config;
        this.connectionString = config.mongoConnection;
        this.mongoClient = new MongoClient(this.connectionString);
    }
    saveUser(user){
        return this.mongoClient.connect()
        .then((client)=>{
            var users = client.db("userstore").collection("users");
            return users.find({userName: user.userName}).toArray()
            .then((result) => {
                if(result.length > 0){
                    return Promise.reject("Conflict");
                }
                else{
                    return users.insertOne(user);
                }
            })
            .catch((error) =>{
                throw error;
            });
        })
    }
    loadUser(user){
        return this.mongoClient.connect()
        .then((client)=>{
            var users = client.db("userstore").collection("users");
            return users.find({userName: user.userName}).toArray()
            .then(result => result.length > 0 ? result[0] : undefined);
        });
    }
    updateUser(user){
        return this.mongoClient.connect()
        .then((client) => {
            var users = client.db("userstore").collection("users");
            return users.updateOne({userName : user.userName},{$set: {claims: user.claims}});
        })
    }
    loadAllUsers(){
        return this.mongoClient.connect()
        .then((client)=>{
            var users = client.db("userstore").collection("users");
            return users.find({}).toArray();
        });
    }
    deleteUser(userId){
        return this.mongoClient.connect()
        .then((client) => {
            var users = client.db("userstore").collection("users");
            return users.deleteOne({_id : userId});
        })
    }
}

module.exports = UserRepos;
