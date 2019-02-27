var express = require('express');
var router = express.Router();
var md5 = require('md5');
var dbmysql = require('../modules/dbmysql');
var pool = dbmysql.pool;
var checkLogin = require("../modules/check").checkLogin;
// 图形验证码
var svgCaptcha = require("svg-captcha");
// 邮件发送
var sendMail = require("../modules/mailer/mail").sendMail
// 上传图片
var multer = require("multer")
var path = require("path");
var storage = multer.diskStorage({
  destination: path.join(path.resolve(__dirname + "../../../"), "/client/images/logo"),
  filename: function (req, file, callback) {
    var newFileName = Date.now() + "-" + req.cookies.account + "-" + file.originalname;
    callback(null, newFileName);
  }
})
var upload = multer({
  storage
})
// 登录
router.get("/captcha", (req, res) => {
  const captcha = svgCaptcha.create({
    width: 120,
    height: 50
  });
  res.cookie("captcha", captcha.text.toUpperCase(), { expires: new Date(Date.now() + 1000 * 60) });
  req.cookies.captcha = captcha.text.toUpperCase();
  // console.log(req.cookies.captcha)
  res.type("svg");
  res.status(200).end(captcha.data);
  // console.log(captcha
})
router.post('/login', function (req, res, next) {
  var account = req.body.account;
  var password = req.body.password;
  var remember = req.body.remember;
  var captcha = req.body.captcha.toUpperCase();
  console.log(captcha + "---" + req.cookies.captcha)
  if (!account || !password || !captcha) {
    res.json({ code: 201, message: '账号、密码或验证码不能为空！' })
    return;
  }
  if (captcha != req.cookies.captcha) {
    res.send({
      code: 201,
      message: "验证码错误"
    })
    return;
  }
  password = md5(password);
  pool.query({
    sql: 'select id,account,logo from users where account=? and password=?',
    values: [account, password]
  }, (err, results) => {
    if (err) {
      res.json({ code: 201, message: '数据库操作错误' + err });
      return;
    }

    if (results.length === 0) {
      res.json({ code: 201, message: '账号或密码有误' });
      return;
    }

    if (remember) {
      res.cookie('remember_account', account, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) });
    } else {
      res.clearCookie('remember_account');
    }

    res.cookie('account', account, { expires: new Date(Date.now() + 1000 * 60 * 60 * 8) });
    res.cookie("userId", results[0].id, { expires: new Date(Date.now() + 1000 * 60 * 60 * 8) })
    res.json({ code: 200, message: '登录成功', userInfo: results[0] });
  });
});

router.post("/logout", (req, res, next) => {
  res.clearCookie("account");
  res.json({
    code: 200,
    message: "退出成功"
  })
})

router.post('/register', function (req, res, next) {
  var account = req.body.account;
  var password = req.body.password;
  var captcha = req.body.captcha.toUpperCase();
  var confirmPassword = req.body.confirmPassword;
  var email = req.body.email;
  console.log(account,password,confirmPassword,email)
  if (!account || !password || !confirmPassword || !email) {
    res.json({ code: 201, message: '账号、密码和邮箱不能为空！' })
    return;
  }
  if (password !== confirmPassword) {
    res.json({ code: 201, message: '两次密码不一致！' })
    return;
  }
  console.log(captcha)
  if (captcha != req.cookies.captcha) {
    res.json({ code: 201, message: "验证码错误" });
    return;
  }
  password = md5(password);

  pool.query({
    sql: "select id from users where account = ? or email = ?",
    values: [account,email]
  }, (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({
        code: 201,
        message: "该账号或邮箱已存在"
      })
      return;
    }
    pool.query({
      sql: 'insert into users(account,password,email) values (?,?, ?)',
      values: [account, password, email]
    }, (err, results) => {
      if (err) {
        res.json({ code: 201, message: '数据库操作错误' + err });
        return;
      }
      res.json({ code: 200, message: '注册成功' });
    })
  })

})

router.post("/upload", checkLogin, upload.single("foo"), (req, res, next) => {
  var account = req.cookies.account;
  var logoPath = `/images/logo/${req.file.filename}`;
  pool.query({
    sql: "update users set logo = ? where account = ?",
    values: [logoPath, account]
  }, (err, result) => {
    if (err) throw err;
    pool.query({
      sql: "select id,logo from users where account = ?",
      values: [account]
    }, (err, userInfo) => {
      res.send({
        code: 200,
        message: "修改成功",
        logoPath,
        userInfo: userInfo[0]
      })
      return;
    })

  })
})

router.post("/editUser", checkLogin, (req, res, next) => {
  var name = req.body.name;
  var nickName = req.body.nickName;
  var phone = req.body.phone;
  var email = req.body.email;
  var qq = req.body.qq;
  var technical = req.body.technical;
  var blogWeb = req.body.blogWeb;
  console.log(technical, blogWeb)
  if (!name || !nickName) {
    res.send({
      code: 201,
      message: "请将资料填写完整"
    })
    return;
  }
  var account = req.cookies.account;
  pool.query({
    sql: "update users set name = ?,nickName = ?,phone = ?,email = ?,qq = ?,technical = ?,blogWeb = ? where account = ?",
    values: [name, nickName, phone, email, qq, technical, blogWeb, account]
  }, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        message: "操作数据库错误" + err
      })
      return;
    }
    pool.query({
      sql: "select id,logo from users where account = ?",
      values: [account]
    }, (err, userInfo) => {
      if (err) {
        res.send({
          code: 201,
          message: "操作数据库错误" + err
        })
        return;
      }
      res.send({
        code: 200,
        message: "修改成功",
        userInfo: userInfo[0]
      })
    })

  })

})

router.post("/changePassword/:account", (req, res) => {
  var password = req.body.password;
  var account = req.params.account;
  password = md5(password)
  pool.query({
    sql: "update users set password = ? where account = ?",
    values: [password, account]
  }, (err, results) => {
    if (err) {
      res.send({ code: 201, message: "数据库操作失败" + err });
      return;
    }
    // console.log(results)
    res.send({
      code: 200,
      message: "密码修改成功"
    })
  })
})

router.post("/sendMail", (req, res, next) => {
  var email = req.body.email;
  var account = req.body.account;
  pool.query({
    sql: "select email from users where account = ?",
    values: [account]
  }, (err, results) => {
    if (err) {
      res.send({
        code: 201,
        message: "数据库操作失败" + err
      })
      return;
    }
    if (results.length == 0) {
      res.send({
        code: 201,
        message: "用户不存在，请重新输入"
      })
      return;
    }
    var email = results[0].email;
    sendMail(email, "找回密码-验证码", "您的验证码为：" + req.cookies.captcha);
    res.send({
      code: 200,
      message: "验证码已发送至邮箱，请注意查收"
    })
  })
})
router.post("/getBackPwd", (req, res) => {
  var account = req.body.account;
  var password = req.body.password;
  var captcha = req.body.captcha.toUpperCase();
  if (captcha != req.cookies.captcha) {
    res.send({ code: 201, message: "验证码错误" }); return;
  }
  password = md5(password);
  pool.query({
    sql: "update users set password = ? where account = ?",
    values: [password, account]
  }, (err, results) => {
    if (err) { res.send({ code: 201, message: "数据库操作失败" + err }); return; }
    if (results.length == 0) {
      res.send({
        code: 201,
        message: "用户不存在，请重新输入"
      })
      return;
    }
    res.send({
      code: 200,
      message: "找回密码成功"
    })
  })
})
router.get("/getUserInfo", checkLogin, (req, res, next) => {
  var account = req.cookies.account;
  // console.log(account); 
  pool.query({
    sql: "select id,account,nickname,technical,createTime,blogWeb,logo from users where account = ?",
    values: [account]
  }, (err, results) => {
    if (err) {
      res.send({ code: 201, message: "数据库操作错误" + err });
      return;
    }
    if (results.length == 0) {
      res.send({
        code: 201,
        message: "用户不存在"
      })
    }
    res.send({
      code: 200,
      message: "成功",
      userInfo: results[0]
    })
  })
})

router.get("/getMostRecommend", (req, res, next) => {
  var displayCount = req.query.displayCount - 0;
  var rankRecommend = req.query.rankRecommend - 0;
  pool.query({
    sql: "select u.id,u.nickname,u.blogWeb,sum(a.recommend) recommends,a.createTime from users u inner join articles a on u.id = a.userId where unix_timestamp(a.createTime) between unix_timestamp()-60*60*24*7 and unix_timestamp() group by id order by recommends desc limit ?",
    values: [displayCount]
  }, (err, results1) => {
    if (err) { res.json({ code: 201, message: "数据库操作失败" + err }); return; }

    pool.query({
      sql: "select u.id,u.nickname,u.blogWeb,sum(a.recommend) recommends,a.createTime from users u inner join articles a on u.id = a.userId group by id order by recommends desc limit ?",
      values: [rankRecommend]
    }, (err, results2) => {
      if (err) { res.json({ code: 201, message: "数据库操作失败" + err }); return; }
      // console.log(results1)
      res.send({
        code: 200,
        message: "成功",
        mostRecommend: results1,
        rankRecommend: results2
      })
    })
  })
})
module.exports = router;
