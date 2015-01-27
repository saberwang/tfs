/**
 * Created with JetBrains WebStorm.
 * User: saber
 * Date: 14-1-8
 * Time: 下午3:37
 * To change this template use File | Settings | File Templates.
 */

var async = require('async'),
    dbGFs = require('../core/db_gfs.js');

//检查文件格式是否为图片
exports.filter_formate = function(req, res, next){
    if(req.files && req.files.upload) {
        var ret = [];
        var file = req.files.upload;
        if(Array.isArray(file)){
            file.forEach(function(i){
                if(/^image\/p?jpeg$|^image\/(x-)?png$/i.test(i.type)) {
                    ret.push(i);
                }
            });
        }
        else {
            if(/^image\/p?jpeg$|^image\/(x-)?png$/i.test(file.type)){
                ret = file;
            }
        }
        req.files.upload = ret;
    }
    next();
};

/**
 * 执行上传动作
 * */
exports.uploadAction = function(req, res, next){
    if(req.files && req.files.upload) {
        var files = Array.isArray(req.files.upload) ? req.files.upload : [req.files.upload];

        var ret = [];
        async.forEachLimit(files, 3, function(file, callBack){
            dbGFs.save(file.path, function(err, doc){
                if(doc) ret.push(doc.fileId);
                callBack(err);
            });
        }, function(err){
            if(err) {
                return res.json({success:false});
            }
            else {
                return res.json({success:true, files:ret});
            }
        });
    }
    else {
        res.json({success:true, files:null});
    }
};
