var express = require("express");
var router = express.Router();
var pool = require("../modules/dbmysql").pool;
var checkLogin = require("../modules/check").checkLogin;

router.get("/getSlideNews", (req, res) => {
    pool.query({
        sql: "select id,src,title from slideNews order by id desc limit 6"
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
        res.send({ code: 200, message: "成功", slideNews: results })
    })
})
router.get("/getSideNews", (req, res) => {
    pool.query({
        sql: "select id,title,info,content from sideNews order by id desc limit 3"
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
        res.send({ code: 200, message: "成功", sideNews: results })
    })
})
router.get("/getDynamicNews", (req, res) => {
    pool.query({
        sql: "select id,title,src,content from dynamicNews order by id desc limit 10"
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
        res.send({ code: 200, message: "成功", dynamicNews: results })
    })
})
router.get("/getFastNews", (req, res) => {
    pool.query({
        sql: "select id,title,src,video,detail,poster from fastNews order by id desc limit 6"
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
        res.send({ code: 200, message: "成功", fastNews: results })
    })
})
router.get("/getPicNews", (req, res) => {
    pool.query({
        sql: "select id,title,src from picNews order by id desc limit 6"
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
        res.send({ code: 200, message: "成功", picNews: results })
    })
})

router.get("/search", (req, res) => {
    var searchKey = req.query.searchKey;
    var pattern = `%${searchKey}%`
    if (searchKey) {
        pool.query({
            sql: "select id,keywords,title,src,content,createTime from weapons where keywords like ?",
            values: [pattern]
        }, (err, results) => {
            if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
            res.send({ code: 200, message: "成功", results })
        })
        return;
    }
    res.send({
        code: 201,
        message: "没有找到符合内容的武器或装备"
    })
})

router.get("/getMovie", (req, res) => {
    var movieId = req.query.movieId;
    pool.query({
        sql: "select id,title,src,video,detail,poster,createTime,comment from fastNews where id = ? order by id desc limit 6",
        values: [movieId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
        if (results.length == 0) {
            res.send({ code: 201, message: "数据加载出错" })
            return;
        }
        res.send({
            code: 200,
            message: "加载成功",
            movie: results[0]
        })
    })
})
router.get("/getContent", (req, res) => {
    var newsId = req.query.newsId;
    var tableName = req.query.tableName;
    pool.query({
        sql: "select id,info,title,content,src,createTime from ?? where id = ? order by id desc limit 6",
        values: [tableName, newsId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
        if (results.length == 0) {
            res.send({ code: 201, message: "数据加载出错" })
            return;
        }
        res.send({
            code: 200,
            message: "加载成功",
            news: results[0]
        })
    })
})
router.get("/getAttitudes", (req, res) => {
    var movieId = req.query.movieId;
    pool.query({
        sql: "select id,movieId,sad,diss,best,angry,badSmile,hit,boring,shock from attitudes a where movieId = ?",
        values: [movieId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
        if (results.length == 0) {
            res.send({ code: 201, message: "数据加载出错" })
            return;
        }
        res.send({
            code: 200,
            message: "加载成功",
            attitudes: results[0]
        })
    })
})
router.get("/getNewsAttitudes", (req, res) => {
    var newsId = req.query.newsId;
    var tableName = req.query.tableName;
    pool.query({
        sql: `select id,movieId,dynamicnewsId,picNewsId,slideNewsId,sad,diss,best,angry,badSmile,hit,boring,shock from attitudes a where ${tableName}Id = ?`,
        values: [newsId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
        if (results.length == 0) {
            pool.query({
                sql: `insert into attitudes(${tableName}Id) values(?)`,
                values: [newsId]
            }, (err, result) => {
                if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
                pool.query({
                    sql: `select id,movieId,dynamicnewsId,picNewsId,slideNewsId,sad,diss,best,angry,badSmile,hit,boring,shock from attitudes a where ${tableName}Id = ?`,
                    values: [newsId]
                }, (err, selectResult) => {
                    if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
                    res.send({
                        code: 200,
                        message: "加载成功",
                        attitudes: selectResult[0]
                    })
                })

            })
            return;
        }
        res.send({
            code: 200,
            message: "加载成功",
            attitudes: results[0]
        })
    })
})

router.post("/updateAttitude", checkLogin, (req, res) => {
    var count = req.body.count - 0 + 1;
    var attitudeId = req.body.attitudeId;
    var userId = req.body.userId;
    var name = req.body.name;
    pool.query({
        sql: "select id from user_attitude_mil where userId = ?",
        values: [userId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
        if (results.length > 0) {
            res.send({ code: 201, message: "您已经表过态了" })
            return;
        }
        pool.query({
            sql: "update attitudes set ?? = ? where id = ?",
            values: [name, count, attitudeId]
        }, (err, result) => {
            if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
            pool.query({
                sql: "insert into user_attitude_mil(userId,attitudeId) values(?,?)",
                values: [userId, attitudeId]
            }, (err, updateResult) => {
                if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
                res.send({
                    code: 200,
                    message: "表态成功"
                })
            })
        })
    })
})
router.post("/updateNewsAttitude", checkLogin, (req, res) => {
    var count = req.body.count - 0 + 1;
    var attitudeId = req.body.attitudeId;
    var userId = req.body.userId;
    var name = req.body.name;
    var tableName = req.body.tableName;
    var newsId = req.body.newsId;
    console.log(userId + "|" + attitudeId)
    pool.query({
        sql: `select id from user_attitude_mil where userId = ? and attitudeId = ?`,
        values: [userId, attitudeId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败1" + err }); return; }
        if (results.length > 0) {
            res.send({ code: 201, message: "您已经表过态了" })
            return;
        }
        pool.query({
            sql: `update attitudes set ?? = ?,${tableName}Id = ? where id = ?`,
            values: [name, count, newsId, attitudeId]
        }, (err, result) => {
            if (err) { res.send({ code: 201, message: "数据操作失败3" + err }); return; }
            pool.query({
                sql: "insert into user_attitude_mil(userId,attitudeId) values(?,?)",
                values: [userId, attitudeId]
            }, (err, updateResult) => {
                if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
                res.send({
                    code: 200,
                    message: "表态成功"
                })
                return;
            })

        })
    })
})



router.get("/getComments", (req, res) => {
    var movieId = req.query.movieId;
    pool.query({
        sql: "select c.id cid,c.movieId mid,c.userId uid,c.comment,c.createTime,u.nickname,u.logo,u.account from comments_mil c inner join users u on c.userId = u.id where movieId = ?",
        values: [movieId]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据操作失败" + err }); return; }
        if (results.length == 0) {
            res.send({
                code: 201,
                message: "暂时没有评论"
            })
            return;
        }
        res.send({
            code: 200,
            message: "成功",
            comments: results
        })
    })
})

router.post("/postComment", checkLogin, (req, res) => {
    var userId = req.body.userId;
    var movieId = req.body.movieId;
    var comment = req.body.comment;
    pool.query({
        sql: "insert into comments_mil(userId,movieId,comment) values(?,?,?)",
        values: [userId, movieId, comment]
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据出错" + err }); return; }
        res.send({
            code: 200,
            message: '成功'
        })
    })
})

module.exports = router;