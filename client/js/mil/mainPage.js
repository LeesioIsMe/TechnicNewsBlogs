$(function () {
    var account = $.cookie("account");
    if (account) {
        $.get(`${host}/users/getUserInfo`, { account }).done(data => {
            if (data.code == 200) {
                $(".login-reg").html(`
                    <div class="me">
                        <span class="account"><a href="../user/personal.html" id="account">${data.userInfo.nickname}</a></span>
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
    // 广告
    $(".adver li").mouseover(function () {
        $(`.adver li:nth-of-type(${$(this).index() + 1}) .two`).slideDown(100);
        $(this).find(".one span").hide();
    }).mouseleave(function () {
        $(`.adver li:nth-of-type(${$(this).index() + 1}) .two`).slideUp(100);
        $(this).find(".one span").show();
    })

    $(".closebg").click(function () {
        $(".adver .feedback").show().siblings().hide();
    })
    $(".return").click(function () {
        $(".adver .feedback").hide().siblings().show();
    })

    $(".feedback a").click(function () {
        $(".adver").html("<h2>广告已为您关闭</h2>");
        setTimeout(function () {
            $(".adver").hide();
        }, 2000)
    })

    // 轮播
    var index = 2;
    var length = 6;
    showPic(1);
    function showPic(index) {
        $(`.slider li:nth-child(${index})`).show().siblings().hide();
        $(`.slider .dot a:nth-child(${index})`).addClass("current").siblings().removeClass("current");
    }
    function autoPlay() {
        showPic(index);
        index++;
        if (index == length + 1) {
            index = 1;
        }
    }
    var timer = setInterval(autoPlay, 1000);

    function getCurrIndex() {
        return $(".slider .dot a[class='current']").index() + 1;
    }


    $("#slider").on("click", ".prev", function () {
        clearInterval(timer);
        var currentIndex = getCurrIndex();
        index = currentIndex - 1;
        if (index == 0) {
            index = length;
        }
        showPic(index);
        if (index == 1) {
            $(".prev-img").show().children(`img:nth-child(${length})`).show().siblings().hide();
        }
        $(".prev-img").show().children(`img:nth-child(${index - 1})`).show().siblings().hide();
    })
    $("#slider").on("mouseover", ".prev,.prev-img", function () {
        clearInterval(timer);
        $(".prev").css("backgroundColor", "rgba(0,0,0,0.8)")
        var currentIndex = getCurrIndex();
        if (currentIndex == 0) {
            currentIndex = length;
        }
        // console.log(currentIndex)
        if (currentIndex == 1) {
            currentIndex = length + 1;
        }
        $(".prev-img").show().children(`img:nth-child(${currentIndex - 1})`).show().siblings().hide();
    }).on("mouseleave", ".prev,.prev-img", function () {
        $(".prev-img").hide();
        $(".prev").css("backgroundColor", "rgba(0,0,0,0.5)")
    })


    $("#slider").on("click", ".next", function () {
        clearInterval(timer);
        var currentIndex = getCurrIndex();
        index = currentIndex + 1;
        if (index == length + 1) {
            index = 1;
        }
        showPic(index);
        if (index == length) {
            $(".next-img").show().children(`img:nth-child(${1})`).show().siblings().hide();
        }
        $(".next-img").show().children(`img:nth-child(${index + 1})`).show().siblings().hide();
    })
    $("#slider").on("mouseover", ".next,.next-img", function () {
        clearInterval(timer);
        $(".next").css("backgroundColor", "rgba(0,0,0,0.8)")
        var currentIndex = getCurrIndex();
        if (currentIndex == length) {
            currentIndex = 0;
        }
        $(".next-img").show().children(`img:nth-child(${currentIndex + 1})`).show().siblings().hide();
    }).on("mouseleave", ".next,.next-img", function () {
        $(".next-img").hide();
        $(".next").css("backgroundColor", "rgba(0,0,0,0.5)")
    })


    // 环球兵器库
    function setPosition(index, ele) {
        var left = 125 * index;
        $(ele).css("left", `${left}px`)
    }
    var currLeft = 0;
    $(".weapon li").each(function (i, li) {
        setPosition(i, li);
    }).mouseover(function () {
        var index = $(this).index();
        $(this).addClass("active").siblings().removeClass("active");
        // console.log(index)
        $(".weapon li").each(function (j, sli) {
            if (j == index) {
                $(sli).css("left", "0");
            } else if (j < index) {
                currLeft = -125 * (index - j);
                $(sli).css("left", `${currLeft}px`);
            } else if (j > index) {
                currLeft = 125 * (j - index) + 650;
                $(sli).css("left", `${currLeft}px`);
            }
        })
    })

    $(".weapon").mouseleave(function () {
        $(".weapon li").each(function (i, li) {
            setPosition(i, li);
        })
        $(".weapon li").removeClass("active");
    })

    $("#searchBtn").click(() => {
        var searchKey = $("#searchKey").val();
        console.log(searchKey)
        location.href = `search.html?${searchKey}`;
    })


    $(document).scroll(() => {
        var scrollLeft = $(".content").offset().left + Number.parseInt($(".content").css("width"))
        var scrollTop = $(document).scrollTop() + $(window).height() - $(".scrollBar").height();
        // console.log(scrollTop)
        // console.log(scrollLeft)
        $(document).scrollTop() >= 500 ? $(".scrollBar").show() : $(".scrollBar").hide();
        $(".scrollBar").css({
            top: scrollTop - 20,
            left: scrollLeft
        })
    })
    $(".scrollBar").click(function () {
        $("html").animate({ scrollTop: 0 }, 500);
        return;
    });
})