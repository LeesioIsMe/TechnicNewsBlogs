var express = require("express");
var router = express.Router();

var pool = require("../modules/dbmysql").pool;
var checkLogin = require("../modules/check").checkLogin;

router.get("/getComments", (req, res, next) => {
    var articleId = req.query.articleId - 0;
    console.log(articleId)
    pool.query({
        sql: "select c.id id,userId uid,u.nickname,comment,good,bad,c.createTime from comments c,users u where c.userId = u.id and articleId = ?",
        values: [articleId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据库操作错误" + err }); return; }

        res.send({
            code: 200,
            message: "成功",
            comments: results
        })
    })
})

router.post("/insertComment", checkLogin, (req, res, next) => {
    var articleId = req.body.articleId - 0;
    var userId = req.body.userId - 0;
    var content = req.body.content;

    pool.query({
        sql: "insert into comments(articleId,userId,comment) values(?,?,?)",
        values: [articleId, userId, content]
    }, (err, results) => {
        if (err) {
            res.json({ code: 201, message: "数据库操作失败" + err }); return;
        }
        pool.query({
            sql: "update articles set comment = comment + 1 where id = ?",
            values: [articleId]
        })
        res.send({
            code: 200,
            message: "评论成功"
        })
    })
    return;
})

router.post("/updateComment", checkLogin, (req, res, next) => {
    var attitude = req.body.attitude;
    var userId = req.body.userId;
    var commentId = req.body.commentId;
    console.log(attitude + "--" + userId + "--" + commentId);
    if (attitude) {
        pool.query({
            sql: "select id from user_comment where userId = ? and commentId = ?",
            values: [userId, commentId]
        }, (err, results) => {
            if (err) {
                res.send({ code: 201, message: '数据库操作失败' + err });
                return;
            }
            if (results.length > 0) {
                res.send({ code: 200, message: "您已经表过态了" });
                return;
            } else {
                pool.query({
                    sql: `update comments set ?? = ?? + 1 where userId = ? and id = ?`,
                    values: [attitude, attitude, userId, commentId]
                }, (err, resultsUpdateComments) => {
                    if (err) {
                        res.send({ code: 201, message: '数据库操作失败' + err });
                        return;
                    }
                    pool.query({
                        sql: "insert into user_comment(userId,commentId) values(?,?)",
                        values: [userId, commentId]
                    }, (err, resultsAddUC) => {
                        if (err) {
                            res.send({ code: 201, message: '数据库操作失败' + err });
                            return;
                        }
                        res.send({
                            code: 200,
                            message: "谢谢您的建议"
                        })
                    })
                })
            }
        })
        return;
    }
})

module.exports = router;
