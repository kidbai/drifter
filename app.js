var express = require('express');
var redis = require('./models/redis.js');
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var mongodb = require('./models/mongodb.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// 扔一个漂流瓶
// POST owner=xxx&type=xxx&content=xxx[&time=xxx]
app.post('/throw', function (req, res) {
    console.log('post ----------');
    console.log(req.body.owner);
  if (!(req.body.owner && req.body.type && req.body.content)) {
      console.log('gg');
   return res.json({code: 0, msg: "信息不完整"});
  }
  if (req.body.type && (["male", "female"].indexOf(req.body.type) === -1)) {
      console.log('gg2');
    return res.json({code: 0, msg: "类型错误"});
  }
  console.log('gg3');

  redis.throw(req.body, function (result) {
      console.log(result);
    res.json(result);
  });
});

// 捡一个漂流瓶
// GET /?user=xxx[&type=xxx]
app.get('/pick', function (req, res) {
  if (!req.query.user) {
    return res.json({code: 0, msg: "信息不完整"});
  }
  if (req.query.type && (["male", "female"].indexOf(req.query.type) === -1)) {
    return res.json({code: 0, msg: "类型错误"});
  }
  redis.pick(req.query, function (result) {
      if(result.code === 1){
          mongodb.save(req.query.user, result.msg, function(err) {
             if(err) {
                 return res.json({
                     code: 0,
                     msg: "获取漂流瓶失败，请重试"
                 });
             }
             return res.json(result);
          });
      }else {
          return res.json({
              code: 0,
              msg: "已经捡没了"
          });
      }
  });
});

// show bottle
app.get('/show', function (req, res) {
    console.log(req.query.user);
    mongodb.getAll(req.query.user, function (result) {
       res.json(result);
     });
})

// index page
app.get('/', function(req, res) {
    res.render('index');
});

app.listen(3000);
