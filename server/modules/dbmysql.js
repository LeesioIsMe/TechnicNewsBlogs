var mysql = require('mysql');
// 创建连接池
var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '171007liwu',
    database: 'blogs'
})
// 导出
module.exports = {
    pool
}