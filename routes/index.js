var express = require('express');
var mysql      = require('mysql');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');


var users = require('./login').items;

var router = express.Router();

var totalCount = 0; 
const PAGELISTCOUNT = 10;
const PAGEADDCOUNT = 5;
const USERNAME = 'machunchao';
const PASSWORD = '499174427'

/* GET home page. */
router.get('/', function(req, res, next) {
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : '19940426',
	  database : 'blog',
      multipleStatements: true
	});
	connection.connect();
	connection.query('select * from blog_item order by blog_id desc limit ' + PAGELISTCOUNT + ';select distinct(type) from blog_item;select count(*) from blog_item', function (error, results, fields) {
	  if (error) throw error;
      totalCount = JSON.stringify(results[2][0]);
      totalCount = totalCount.replace(/.*:/ig,'').replace(/}/ig,'');
      totalCount = +totalCount;
      res.render('index', { blogs: results[0] , types: results[1] , counts: results[2] });       
      
    });
    connection.end();
});

router.get('/admin', function(req, res, next) {
    res.render('adminLogin')
});

router.post('/submitBlog', function(req, res, next) {

    var namePath =  getNowFormatDate() + '_' + new Date().getTime() + '.html';
    var realPath = './views/blogs/' + namePath;
    
    var content = req.body.content;
    var title = req.body.title;
    var intro = req.body.intro;
    var img = req.body.img;
    var metaK = req.body.metaK;
    var metaD = req.body.metaD;
    var type = req.body.type || req.body.type_select;
    var date = getNowFormatDate();

    content = `
        <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" type="text/css" href="../../stylesheets/mcc_custom.css" /><meta name="keywords" content="`
    +  metaK + `"> <meta name="description" content="` + metaD + 
                `"><title>` + title + `</title>
            </head>
            <body>
            <div class="header">
                
            </div>

            <div class="main-content"><div class="content-title">` + title + `</div>
    <div class="content">
    ` + content + `</div>
            </div>
            </body>
            <script src="../../javascripts/vendor/jquery.2.2.3.min.js"></script>
            <script src="../../javascripts/js/public_share_code.js"></script>

        </html> `;

    var imgReg = /<img.*?(?:>|\/>)/gi;
    var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    var imgR = content.match(imgReg);
    var imgsrc = ''
    if(imgR && imgR.length > 0) {
        imgsrc = imgR[0].match(srcReg)[1];
    }

    fs.writeFile(realPath, content,function(err){
        if(err) console.log('写文件操作失败');
        else console.log('写文件操作成功');
    });
    //insert into blog_item (title,intro,img,type,date,html_name)value('demo title','demo intro','/images/demo.img','人工智能','2018-08-26','demo.html');
    var sql = 'insert into blog_item (title,intro,img,type,date,html_name)value("' + title + '","' + intro + '","' + imgsrc + '","' + type + '","' + date + '","' + namePath + '")';

    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '19940426',
      database : 'blog'
    });
    connection.connect();
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
      res.render('admin', { types: results });       
    });
    connection.end();

});

router.post('/admin/image_upload', function(req, res, next) {
    var form = new multiparty.Form();
    /* 设置编辑 */

    form.encoding = 'utf-8';
    //设置文件存储路劲
    form.uploadDir = './public/images/blog_content_images';
    //设置文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
    // form.maxFields = 1000;   //设置所有文件的大小总和
    //上传后处理
    form.parse(req, function(err, fields, files) {
        var filesTemp = JSON.stringify(files, null, 2);

        if(err) {
            console.log('parse error:' + err);
        }else {
            // console.log('parse files:' + filesTemp);
            var randNum = RandNum(5);
            var inputFile = files.upload[0];
            var uploadedPath = inputFile.path;
            var dstPath = './public/images/blog_content_images/' + randNum + '_' + inputFile.originalFilename;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function(err) {
                if(err) {
                    console.log('rename error:' + err);
                }else {
                    console.log('rename ok');
                }
            })
        }
        // res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
        // res.write({"uploaded":1,"url":dstPath});
       
        res.json({
            "uploaded": true,
            "url": dstPath.substring(8)
        });
    })
});

router.get('/index', function(req, res, next) {
    var lis = req.query.contentNum;

    var type = req.query.type;
    console.log(type);
    type = decodeURIComponent(type);
    var sql = '';
    if(type == 'null') {
        sql = 'select * from blog_item order by blog_id desc limit ' + lis + ',' + PAGEADDCOUNT + ';'
    }else {
        sql = 'select * from blog_item where type = "' + type + '" order by blog_id desc limit ' + lis + ',' + PAGEADDCOUNT + ';';
    }
    console.log(sql+'!'+totalCount+'!'+lis);

    if(totalCount<=lis) {
        res.json({
            'noContent':1
        });
    }else {
        var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : '19940426',
          database : 'blog',
          multipleStatements: true
        });
        connection.connect();
        connection.query(sql, function (error, results, fields) {
          if (error) throw error;
          res.json({
            'results': results
          });  
        });
        connection.end();
    }
});


router.get('/category', function(req, res, next) {
    var type = req.query.type;
    type = decodeURIComponent(type);
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '19940426',
      database : 'blog',
      multipleStatements: true
    });
    connection.connect();
    connection.query('select * from blog_item where type = "' + type + '" order by blog_id desc limit ' + PAGELISTCOUNT + ';select distinct(type) from blog_item;select count(*) from blog_item where type="'+ type + '";', function (error, results, fields) {
      if (error) throw error;
      totalCount = JSON.stringify(results[2][0]);
      totalCount = totalCount.replace(/.*:/ig,'').replace(/}/ig,'');
      totalCount = +totalCount;
      res.render('index', { blogs: results[0] , types: results[1] , counts: results[2] });       
      
    });
    connection.end();
});

router.post('/adminLogin', function(req, res, next){
 
    var username = req.body.username;
    var password = req.body.password;
   
    if(username.trim() == USERNAME && password.trim() == PASSWORD){
        var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : '19940426',
          database : 'blog'
        });
        connection.connect();
        connection.query('select distinct(type) from blog_item;', function (error, results, fields) {
          if (error) throw error;
          res.render('admin', { types: results });       
        });
            connection.end();     
    }else {
         res.render('adminLogin');
    }
        
});


//随机数
function RandNum(n){
    var rnd="";
    for(var i=0;i<n;i++)
        rnd+=Math.floor(Math.random()*10);
    return rnd;
}

//生成文件
var createFolder = function(to) { //文件写入
    var sep = path.sep
    var folders = path.dirname(to).split(sep);
    var p = '';
    while (folders.length) {
        p += folders.shift() + sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
};



//得到当前日期 YYYY-MM-DD
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

module.exports = router;
