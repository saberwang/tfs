/**
 * Created with JetBrains WebStorm.
 * User: saber
 * Date: 14-1-8
 * Time: 上午11:56
 * To change this template use File | Settings | File Templates.
 */

var dbPool = require('./db_pool.js'),
    fs = require('fs'),
    path = require('path'),
    ObjectId = require('mongoskin').ObjectID;

var gfs = {
    //save a file into grid file system
    save:function(file, callBack){
        //see if the file exist
        fs.exists(file, function(exist){
            if(!exist) return callBack(new Error('file is not exist'));

            //get an db connction from pool
            dbPool.acquire(function(err, db){
                if(err) return callBack && callBack(err);
                var gs = db.gridfs();
                gs.open(new ObjectId(), 'w', {metadata:{path:file}}, function(err, gs){
                    if(err) {
                        dbPool.release(db);
                        return callBack && callBack(err);
                    }

                    //save the file into database
                    gs.writeFile(file, function(err, doc){
                        dbPool.release(db);
                        callBack && callBack(err, doc);
                    });
                });
            });
        });
    },
    //see if the file exist in mongodb @param file mix(string or objectID)
    exists:function(file, callBack) {
        dbPool.acquire(function(err, db){
            if(err) return callBack && callBack(err);
            var gs = db.gridfs();
            gs.exist(file, 'fs', function(err, exist){
                dbPool.release(db);
                callBack && callBack(err, exist);
            });
        });
    },
    //read the content from gridFs, return buffer
    read:function(file, callBack){
        dbPool.acquire(function(err, db){
            if(err) return callBack && callBack(err);
            var gs = db.gridfs();
            gs.open(file, 'r', function(err, gs){
                if(err) {
                    dbPool.release(db);
                    return callBack && callBack(err);
                }
                gs.seek(0, function(){
                    gs.read(function(err, data){
                        dbPool.release(db);
                        callBack && callBack(err, {data:data, metadata:gs.metadata});
                    });
                });
            });
        });
    },
    //create an read stream from gridFs
    createReadStream : function(file, callBack){
        dbPool.acquire(function(err, db){
            if(err) return callBack && callBack(err);
            var gs = db.gridfs();
            gs.open(file, 'r', function(err, gs){
                if(err) {
                    dbPool.release(db);
                    return callBack && callBack(err);
                }

                var stream = gs.stream(true);
                callBack && callBack(null, stream);
                stream.on('end', function(){
                    dbPool.release(db);
                });
            });
        });
    },
    //create a write steam from gridFs
    createWriteStream:function(file, meta, callBack){
        dbPool.acquire(function(err, db){
            if(err) return callBack && callBack(err);
            var gs = db.gridfs();
            gs.open(file, 'w', {metadata:meta}, function(err, gs){
                if(err) {
                    dbPool.release(db);
                    return callBack && callBack(err);
                }
                var stream = gs.stream(true);
                callBack && callBack(null, stream);
                stream.on('end', function(){
                    dbPool.release(db);
                });
            });
        });
    }
};


module.exports = gfs;
