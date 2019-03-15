// 用来绑定文章发布列表数据
<<<<<<< HEAD
function bindPostItem(categoryId, pageSize, pageCount, currentPage, keywords) {
    $.get(`${host}/articles/getArticles/${categoryId}`, {
        currentPage,
        pageSize,
        pageCount,
        keywords
=======
function bindPostItem(categoryId, pageSize, pageCount, currentPage) {
    $.get(`${host}/articles/getArticles/${categoryId}`, {
        currentPage,
        pageSize,
        pageCount
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
    }).done(function (data) {
        if (data.code == 200) {
            // console.log(data)
            var html = template("post_item_tmp", { data: data.articles });
            $("#post_item").html(html);
            $("#pager").html(template("pager_tmp", { page: data.page }));
<<<<<<< HEAD
            $("#my_comments").html("")
=======
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
            return;
        }
        $("#post_item").html(data.message);
        $("#pager").html();
<<<<<<< HEAD
        $("#my_comments").html("")
=======
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
    }).fail(err => {
        throw err;
    })
}


<<<<<<< HEAD
=======

>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
$(function () {
    var pageSize = 5;
    var pageCount = 3;
    var account = $.cookie("account");
    if (account) {
        $.get(`${host}/users/getUserInfo`, { account }).done(data => {
            if (data.code == 200) {
                $(".login").html(`
                    <div class="me">
<<<<<<< HEAD
                        <span class="account"><a href="user/personal.html" id="account">${data.userInfo.nickname || account}</a></span>
=======
                        <span class="account"><a href="user/personal.html" id="account">${data.userInfo.nickname}</a></span>
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
                        <img id="smlogo" src=${data.userInfo.logo} alt="">
                        <span class="logout"><a href="javascript:;" onclick="logout()">退出</a></span>
                    </div>
                `)
                return
            }
        }).fail(err => {
            throw err;
        })
    }

    var categoryId = 1;
    var currentPage = 1;

<<<<<<< HEAD
    bindPostItem(categoryId, pageSize, pageCount, currentPage, "");
=======
    bindPostItem(categoryId, pageSize, pageCount, currentPage);
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13

    $(".nav li").click(function () {

        $(this).children("a").addClass("active");
        $(this).siblings().children("a").removeClass("active");
<<<<<<< HEAD
        if ($(this).prop("id") == "myComments") {
            console.log("aaa")
            $.get(`${host}/comments/getMyComments`, {
                account
            }).done(data => {
                console.log(data);
                if (data.code == 202) {
                    $("#my_comments").html("请先 <a href='user/login.html'>登录</a> 后才可查看");
                    $("#post_item").html("");
                    return;
                }
                if (data.code == 201) {
                    $("#my_comments").html("数据出错");
                    $("#post_item").html("");
                    return;
                }
                $("#post_item").html("");
                $("#my_comments").html(template("my_comments_tmp", { data: data.info, account }))
                return;
            }).fail(err => {
                throw err;
            })
            return;
        }
=======

>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
        categoryId = $(this).index() + 1;
        currentPage = 1;

        console.log(categoryId);
<<<<<<< HEAD
        bindPostItem(categoryId, pageSize, pageCount, currentPage, "");
=======
        bindPostItem(categoryId, pageSize, pageCount, currentPage);
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13

    })

    $("#pager").on("click", ".pager a", function () {
        console.log($(this) == $(".prev"))
        if ($(this).html() == $(".prev").html() || $(this).html() == $(".next").html()) {
            $(this).html() == $(".prev").html() ? (currentPage == 1 ? currentPage : currentPage--) : (currentPage == $.cookie("maxPage") - 0 ? currentPage : currentPage++);
        } else {
            currentPage = $(this).text() - 0;
        }
<<<<<<< HEAD
        bindPostItem(categoryId, pageSize, pageCount, currentPage, "");
=======
        bindPostItem(categoryId, pageSize, pageCount, currentPage);
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
    })

    $("#post_item").on("click", "#recommend", function () {
        if ($.cookie("account")) {
            $(".recommand_tip").removeClass("show");
            var recommend = true;
            var postId = $(this).data("postid") - 0;
            console.log($(this).data("postid"))
            $.post(`${host}/articles/updateArticle`, {
                recommend,
                postId,
            }).done(data => {
                console.log(data);
                if (data.code == 200) {
<<<<<<< HEAD
                    bindPostItem(categoryId, pageSize, pageCount, currentPage, "");
                }
                if (data.code == 201) {
=======
                    bindPostItem(categoryId, pageSize, pageCount, currentPage);
                }
                if(data.code == 201){
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
                    layer.alert(data.message)
                }
            }).fail(err => {
                throw err;
            })
            return;
        }
        $(".recommand_tip").addClass("show");
    })
    var displayCount = 5;
    var rankRecommend = 20;
    $.get(`${host}/users/getMostRecommend`, {
        displayCount,
        rankRecommend
    }).done(data => {
        // console.log(data);
        if (data.code == 200) {
            // console.log(data.mostRecommend)
            $("#newRecommends").html(template("newRecommends_tmp", { data: data.mostRecommend }))
            $("#rankRecommends").html(template("rankRecommends_tmp", { data: data.rankRecommend }))
        }
    }).fail(err => {
        throw err;
    })
    $.get(`${host}/articles/getCounts`).done(data => {
        // console.log(data)
        if (data.code == 200) {
            $("#statistics").html(template("statistics_tmp", { data: data.counts }))
        }
    }).fail(err => {
        throw err;
    })
<<<<<<< HEAD

    $(".searchBtn").click(function () {
        console.log($(this).data("id"))
        var categoryId1 = $(this).data("id");
        var keywords = $(this).siblings("input").val();
        bindPostItem(categoryId1, pageSize, pageCount, currentPage, keywords);
    })

=======
>>>>>>> 10d3ebffec26455b5747750ab5de693a4e62af13
})