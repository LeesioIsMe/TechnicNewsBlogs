// 用来绑定文章发布列表数据
function bindPostItem(categoryId, pageSize, pageCount, currentPage, keywords) {
    $.get(`${host}/articles/getArticles/${categoryId}`, {
        currentPage,
        pageSize,
        pageCount,
        keywords
    }).done(function (data) {
        if (data.code == 200) {
            // console.log(data)
            var html = template("post_item_tmp", { data: data.articles });
            $("#post_item").html(html);
            $("#pager").html(template("pager_tmp", { page: data.page }));
            $("#my_comments").html("")
            return;
        }
        $("#post_item").html(data.message);
        $("#pager").html();
        $("#my_comments").html("")
    }).fail(err => {
        throw err;
    })
}


$(function () {
    var pageSize = 5;
    var pageCount = 3;
    var account = $.cookie("account");
    if (account) {
        $.get(`${host}/users/getUserInfo`, { account }).done(data => {
            if (data.code == 200) {
                $(".login").html(`
                    <div class="me">
                        <span class="account"><a href="user/personal.html" id="account">${data.userInfo.nickname || account}</a></span>
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

    bindPostItem(categoryId, pageSize, pageCount, currentPage, "");

    $(".nav li").click(function () {

        $(this).children("a").addClass("active");
        $(this).siblings().children("a").removeClass("active");
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
        categoryId = $(this).index() + 1;
        currentPage = 1;

        console.log(categoryId);
        bindPostItem(categoryId, pageSize, pageCount, currentPage, "");

    })

    $("#pager").on("click", ".pager a", function () {
        console.log($(this) == $(".prev"))
        if ($(this).html() == $(".prev").html() || $(this).html() == $(".next").html()) {
            $(this).html() == $(".prev").html() ? (currentPage == 1 ? currentPage : currentPage--) : (currentPage == $.cookie("maxPage") - 0 ? currentPage : currentPage++);
        } else {
            currentPage = $(this).text() - 0;
        }
        bindPostItem(categoryId, pageSize, pageCount, currentPage, "");
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
                    bindPostItem(categoryId, pageSize, pageCount, currentPage, "");
                }
                if (data.code == 201) {
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

    $(".searchBtn").click(function () {
        console.log($(this).data("id"))
        var categoryId1 = $(this).data("id");
        var keywords = $(this).siblings("input").val();
        bindPostItem(categoryId1, pageSize, pageCount, currentPage, keywords);
    })

})