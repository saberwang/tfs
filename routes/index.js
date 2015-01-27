
/*
 * GET home page.
 */

var fs = require('fs'),
    path = require('path'),
    dbGFs = require('../core/db_gfs.js'),
    gm = require('gm'),
    ObjectID = require('mongoskin').ObjectID;

//生成文件名
var generateFileName = function(fileId, w, h){
    if(!w && !h) return fileId;
    return fileId + '_' + (w || 0) + '_' + (h || 0);
};

//将字符串转换成objectID
var toObjectId = function(hex) {
    if(hex instanceof ObjectID){
        return hex;
    }
    if(!hex || hex.length !== 24){
        return hex;
    }

    return ObjectID.createFromHexString(hex);

};

//参数初始化
exports.filter_init = function(req, res, next){
    var fileId = req.query.file;

    if(!fileId) {
        req.exception = true;
        return next();
    }

    //某些情况下前方应用加了前缀，这边忽略
    var includeExtensionReg = /^(\w+)\.\w+$/;
    if(includeExtensionReg.test(fileId)) {
       var arr = includeExtensionReg.exec(fileId);
        fileId = arr[1];
    }

    var w = req.query.w && /\d+/.test(req.query.w) && req.query.w > 0 ? req.query.w : null;
    var h = req.query.h && /\d+/.test(req.query.h) && req.query.h > 0 ? req.query.h : null;

    var outputFileId = generateFileName(fileId, w, h);
    var assertDir = path.join(req.app.get('home'), 'public', 'assert');
    var outputFilePath = path.join(assertDir, outputFileId)+req.app.get('image_ext');
    var filePath = path.join(assertDir, fileId)+req.app.get('image_ext');

    req.initParam = {fileId:fileId, w:w, h:h, outputFileId:outputFileId, outputFilePath:outputFilePath, filePath:filePath};

    next();
};

//判断输出文件是否已经生成
exports.filter_exists = function(req, res, next){

    if(req.exception || req.done) return next();

    fs.exists(req.initParam.outputFilePath, function(exists){
        //已经存在
        if(exists) {
            req.done = true; //设置done表示接下去无需任何filter操作
        }

        return next();
    });
};

//输出原文件
exports.filter_outputorigin_file = function(req, res, next){
    if(req.exception || req.done) return next();

    //原文件是否已经输出
    fs.exists(req.initParam.filePath, function(exist){
        //原文件不存在
        if(!exist) {
            dbGFs.exists(toObjectId(req.initParam.fileId), function(error,exist){
                //数据库中没有对应文件
                if(!exist) {
                    req.exception = true;
                    return next();
                }

                dbGFs.createReadStream(toObjectId(req.initParam.fileId), function(err, gfsStream){
                    if(err) {
                        //req.exception = true;
                        return next(err);
                    }

                    var fileStream = fs.createWriteStream(req.initParam.filePath);
                    gfsStream.pipe(fileStream);
                    fileStream.on('close', function(){
                        if(req.initParam.filePath == req.initParam.outputFilePath) {
                            req.done = true;
                        }

                        return next();
                    });
                });
            });
        }
        else {
            return next();
        }

    });
};

//调整，生成缩略图
exports.filter_resize = function(req, res, next){
    if(req.exception || req.done) return next();

    if(req.initParam.w && req.initParam.h) {
        gm(req.initParam.filePath).resize(req.initParam.w, req.initParam.h, '^').gravity('Center').crop(req.initParam.w, req.initParam.h).quality(100).write(req.initParam.outputFilePath,function(err){
            if(err) return next(err);
            req.done = true;
            next();
        });
    }
    else {
        gm(req.initParam.filePath).resize(req.initParam.w,req.initParam.h).quality(50).write(req.initParam.outputFilePath, function(err){
            if(err) return next(err);
            req.done = true;
            next();
        });
    }
};

var maxAge = 1000*60*60*48;
exports.index = function(req, res, next){
    if(req.exception || !req.done) return next();
    //res.setHeader('Content-Type', 'image/jpeg');
    res.sendfile(req.initParam.outputFilePath, {maxAge:maxAge});
};