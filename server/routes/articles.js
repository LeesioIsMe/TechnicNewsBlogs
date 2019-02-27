var express = require("express");
var router = express.Router();
var dbmysql = require("../modules/dbmysql");
var pool = dbmysql.pool;
var checkLogin = require("../modules/check").checkLogin;
var getPager = require("../modules/check").getPager;

router.post("/postArticle", checkLogin, (req, res, next) => {
    var type1 = req.body.type1;
    var type2 = req.body.type2;
    var type3 = req.body.type3;
    var title = req.body.title;
    var content = req.body.content;
    var summary = req.body.summary;
    if (type1 == -1 || !title || !content) {
        res.json({ code: 201, message: '类型，标题，内容不能为空' });
        return;
    }
    var sql = `insert into articles(categoryId1, categoryId2, categoryId3, userId, title, summary, content) values (${type1 - 0}, ${type2 - 0}, ${type3 - 0}, ${req.cookies.userId - 0}, '${title}', '${summary}', '${content}')`;
    pool.query(sql, function (err, results) {
        if (err) {
            res.json({ code: 201, message: '数据库操作错误' + err });
            return;
        }
        res.json({ code: 200, message: '提交成功' });
    })
})

router.get("/getArticles/:categoryId?", function (req, res, next) {
    var categoryId = req.params.categoryId - 0;
    console.log(categoryId)
    var pageSize = req.query.pageSize - 0;
    var pageCount = req.query.pageCount - 0;
    var currentPage = req.query.currentPage - 0;
    var keywords = req.query.keywords;
    var condition = { sql: "select * from articles" }
    if (categoryId) {
        condition = {
            sql: "select a.id postId,a.categoryId1,a.title,a.content,a.summary,a.recommend,a.comment,a.read,a.against,a.createTime,u.id,u.account,u.nickname,u.logo from articles a inner join users u on categoryId1 = ? and a.userId = u.id order by createTime desc limit ?,?",
            values: [categoryId, pageSize * (currentPage - 1), pageSize]
        }
        if (keywords) {
            condition = {
                sql: `select a.id postId,a.categoryId1,a.title,a.content,a.summary,a.recommend,a.comment,a.read,a.against,a.createTime,u.id,u.account,u.nickname,u.logo from articles a inner join users u on categoryId1 = ? and a.userId = u.id where a.title like '%${keywords}%' order by createTime desc limit ?,?`,
                values: [categoryId, pageSize * (currentPage - 1), pageSize]
            }
        }
    }
    pool.query({
        sql: "select count(*) as count from articles where categoryId1 = ?",
        values: [categoryId]
    }, (err, counts) => {
        if (err) {
            res.json({ code: 201, message: "数据库操作错误" + err });
            return;
        }
        // console.log(counts);
        var count = counts[0].count;
        if (count > 0) {
            var maxPage = Math.ceil(count / pageSize);
            var page = getPager(pageCount, currentPage, maxPage);
            res.cookie('maxPage', maxPage, { expires: new Date(Date.now() + 1000 * 60 * 60 * 8) });
            // console.log(maxPage)
            // console.log(page)
            pool.query(condition, function (err, results) {
                if (err) {
                    res.json({ code: 201, message: "数据库操作错误" + err });
                    return;
                }
                // console.log(results)
                res.json({
                    code: 200,
                    message: "成功",
                    articles: results,
                    page,
                })
            })
            return;
        }
        res.send({
            code: 201,
            message: "记录为空，暂时没有数据"
        })

    })

})

router.post("/updateArticle", checkLogin, (req, res, next) => {
    var recommend = req.body.recommend || false;
    var against = req.body.against || false;
    var account = req.cookies.account;
    var postId = req.body.postId - 0;
    // console.log(recommend + "--" + against + "--" + "--" + postId)
    var attrName = "";
    var status = false;
    if (recommend) {
        attrName = "recommend";
        pool.query({
            sql: "select id from user_recommend  where account = ? and articleId = ? union select id from user_against  where account = ? and articleId = ?",
            values: [account, postId, account, postId]
        }, (err, results) => {
            if (err) {
                res.json({ code: 201, message: "数据库操作失败" + err }); return;
            }
            if (results.length != 0) {
                res.send({
                    code: 201,
                    message: "您已经推荐过本篇文章了"
                })
                return;
            } else {
                var condition = {
                    sql: `update articles set ${attrName} = ${attrName} + 1 where id = ${postId}`,
                }
                console.log(condition)
                pool.query(condition, (err, resultsA) => {
                    if (err) {
                        res.send({ code: 201, message: "数据库操作失败" + err });
                        return;
                    }
                    pool.query({
                        sql: "insert into user_recommend(account,articleId) values(?,?)",
                        values: [account, postId]
                    }, (err, resultsUR) => {
                        if (err) {
                            res.send({ code: 201, message: "数据库操作失败" + err });
                            return;
                        }
                        console.log(resultsUR);
                        res.send({
                            code: 200,
                            message: "操作成功"
                        })
                        return;
                    })

                })
            }
        })
    } else if (against) {
        attrName = "against";
        pool.query({
            sql: "select id from user_recommend where account = ? and articleId = ? union select id from user_against where account = ? and articleId = ?",
            values: [account, postId, account, postId]
        }, (err, results) => {
            if (err) {
                res.json({ code: 201, message: "数据库操作失败" + err }); return;
            }
            if (results.length != 0) {
                res.send({
                    code: 201,
                    message: "您已经推荐过本篇文章了"
                })
                return;
            } else {
                var condition = {
                    sql: `update articles set ${attrName} = ${attrName} + 1 where id = ${postId}`,
                }
                console.log(condition)
                pool.query(condition, (err, resultsA) => {
                    if (err) {
                        res.send({ code: 201, message: "数据库操作失败" + err });
                        return;
                    }
                    pool.query({
                        sql: "insert into user_against(account,articleId) values(?,?)",
                        values: [account, postId]
                    }, (err, resultsUR) => {
                        if (err) {
                            res.send({ code: 201, message: "数据库操作失败" + err });
                            return;
                        }
                        console.log(resultsUR);
                        res.send({
                            code: 200,
                            message: "操作成功"
                        })
                        return;
                    })

                })
            }
        })
    }
})
router.get("/getCounts", (req, res, next) => {
    pool.query({
        sql: "select c.typeName,count(a.id) count from articles a,categories c where c.id = a.categoryId1 group by typeName"
    }, (err, results) => {
        if (err) { res.send({ code: 201, message: "数据库操作失败" + err }); return; }
        // console.log(results)
        res.send({
            code: 200,
            message: "操作成功",
            counts: results
        })
    })
})

router.get("/getContent", (req, res, next) => {
    var id = req.query.id - 0;
    pool.query({
        sql: "select count(id) count from articles"
    }, (err, count) => {
        var maxCount = count[0].count;
        if (id == maxCount) {
            condition = {
                sql: "select a.id postId,a.categoryId1,a.title,a.content,a.summary,a.recommend,a.comment,a.read,a.against,a.createTime,u.id userId,u.account,u.nickname,u.logo,c.typeName,c.id cid from articles a inner join users u inner join categories c on a.userId = u.id and a.categoryId1 = c.id where a.id = ? or a.id = ?",
                values: [id, id - 1]
            }
        } else if (id == 1) {
            condition = {
                sql: "select a.id postId,a.categoryId1,a.title,a.content,a.summary,a.recommend,a.comment,a.read,a.against,a.createTime,u.id userId,u.account,u.nickname,u.logo,c.typeName,c.id cid from articles a inner join users u inner join categories c on a.userId = u.id and a.categoryId1 = c.id where a.id = ? or a.id = ?",
                values: [id, id + 1]
            }
        } else {
            condition = {
                sql: "select a.id postId,a.categoryId1,a.title,a.content,a.summary,a.recommend,a.comment,a.read,a.against,a.createTime,u.id userId,u.account,u.nickname,u.logo,c.typeName,c.id cid from articles a inner join users u inner join categories c on a.userId = u.id and a.categoryId1 = c.id where a.id = ? or a.id = ? or a.id = ?",
                values: [id - 1, id, id + 1]
            }
        }
        pool.query(condition, (err, results) => {
            if (err) {
                res.send({ code: 201, message: "数据库操作失败" + err }); return;
            }
            if (results.length == 0) {
                res.send({
                    code: 201,
                    message: "数据不存在"
                })
                return;
            }
            // console.log(results)
            pool.query({
                sql: "update articles set `read` = `read` + 1 where id = ?",
                values: [id]
            }, (err, result) => {
                if (err) {
                    res.send({ code: 201, message: "数据库操作失败" + err }); return;
                }
                console.log(maxCount + "------------------")
                // console.log(results)
                res.send({
                    code: 200,
                    message: "成功",
                    article: results,
                    maxCount
                })
            })
        })

    })

})

module.exports = router;