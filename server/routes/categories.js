var express = require("express");
var router = express.Router();
var dbmysql = require("../modules/dbmysql");
var pool = dbmysql.pool;

router.get("/getCategories", (req, res, next) => {
    pool.query("select * from categories", (err, results) => {
        if (err) {
            res.json({
                code: 201,
                message: "数据库操作错误" + err
            })
            return;
        }
        // console.log(results)
        res.json({
            code: 200,
            message: "成功",
            categories: results
        })
    })
})


module.exports = router;