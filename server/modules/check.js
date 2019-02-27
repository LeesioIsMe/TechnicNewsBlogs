function checkLogin(req, res, next) {
    if (req.cookies && req.cookies.account) {
        next();
        return;
    } else {
        res.json({
            code: 202,
            message: '未登录'
        })
    }
}
function getPager(pageCount, currentPage, maxPage) {
    var page = [currentPage];
    var leftPage = currentPage - 1;
    var rightPage = currentPage + 1;
    while (page.length < pageCount) {
        if (page.length < pageCount && leftPage > 0) page.unshift(leftPage--);
        if (page.length < pageCount && rightPage < maxPage) page.push(rightPage++);
    }
    return page;
}

module.exports = {
    checkLogin,
    getPager
}