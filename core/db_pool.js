/**
 * Created with JetBrains WebStorm.
 * User: saber
 * Date: 14-1-8
 * Time: 上午11:27
 * To change this template use File | Settings | File Templates.
 */


var mongoskin = require('mongoskin');
var pool = require('generic-pool');

var dbConfig = {
    host:'127.0.0.1',
    port:27017,
    db:'aihuishou',
    auto_reconnect:true,
    poolSize:1
};

var generate_mongo_url = function(config) {
    config.host = config.host || 'localhost';
    config.port = config.port || 27017;
    config.db = config.db || 'test';
    config.auto_reconnect = config.auto_reconnect || true;
    config.poolSize = config.poolSize || 1;

    if(config.username && config.password){
        return config.username + ':' + config.password + '@' + config.host + ':' + config.port + '/' + config.db + '?auto_reconnect=' + config.auto_reconnect + '&poolSize='+config.poolSize;
    }
    else {
        return config.host + ':' + config.port + '/' + config.db + '?auto_reconnect=' + config.auto_reconnect + '&poolSize='+config.poolSize;
    }
};


module.exports = exports = pool.Pool({
    name:'mongodb',
    create:function(callBack) {
        var db = mongoskin.db(generate_mongo_url(dbConfig));
        db.open(function(err){
            callBack(err, db);
        });
    },
    destroy:function(db) {
        db.close();
    },
    max:20,
    min:5,
    idleTimeoutMillis :  1000*60*20
});

