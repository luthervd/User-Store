var crypto = require("crypto");
var UserRepos = require("./userRepos");
var defaultConfig = require('./config');

class UserStoreApp{
    constructor(config){
        this.config = config === undefined ? defaultConfig : config;
        this.repos = new UserRepos(this.config);
        this.userStore = [];
    }
    addUser(userName, password, accountNumber){
        return new Promise((resolve, reject) => {
            var hash = crypto.createHash('sha256');
            hash.on("readable",() => {
                const data = hash.read();
                if(data){
                    let claims = [];
                    if(this.config.defaultClaims){
                        claims = this.config.defaultClaims;
                    }
                    return this.repos.saveUser({userName: userName, password: data.toString("base64"), accountNumber: accountNumber, claims: claims})
                    .then(result => {
                        resolve(result.result);
                    })
                    .catch(error => 
                       { 
                           reject(error);
                    }
                    );
                }
            });
            hash.write(password+this.config.salt, function(){ 
                hash.end(); 
            });
        });       
    };
    authenticateUser(userName,password){
        return new Promise((resolve,reject) => {
            var hash = crypto.createHash('sha256');
            hash.on("readable",() => {
                const data = hash.read();
                if(data){
                    this.repos.loadUser({userName: userName, password: data.toString("base64")})
                    .then((user) =>{
                         resolve(user);
                    })
                    .catch(error => {
                        reject(error)
                    });
                } 
            });
            hash.write(password+this.config.salt, function() {hash.end();});        
        });
    };
    readUser(userName){
        return this.repos.loadUser({userName: userName});
    };
    addClaims(userName, claims){
        return this.repos.loadUser({userName: userName})
               .then((user) => {
                    claims.forEach(x => user.claims.push(x));
                    return this.repos.updateUser(user)
                    .then((result) => {
                        if(result.result.ok === 1){
                            return Promise.resolve({numberOfUpdatedClaims: claims.length});
                        }
                        else{
                            return Promise.reject("Error updating claims");
                        } 
                    });
               })
    };
    readAllUsers(){
        return this.repos.loadAllUsers();
    };
    deleteUser(userId){
        return this.repos.deleteUser(userId);
    }
};

module.exports = UserStoreApp;