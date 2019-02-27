var nodemailer = require("nodemailer");
var nodemailerSmtpTransport = require("nodemailer-smtp-transport");
var config = require("./config");

var smtpTransporter = nodemailer.createTransport(nodemailerSmtpTransport({
    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
    service: config.email.service,
    auth: {
        user: config.email.user,
        //这里密码不是qq密码，是你设置的smtp密码
        pass: config.email.pass
    }
}));

exports.sendMail = function (accepter, title, content) {
    console.log("aaa");
    smtpTransporter.sendMail({
        from: config.email.user,
        to: accepter,
        subject: title,
        text: content
    }, function (err, response) {
        if (err) return console.log(err);

        console.log("Message Info:" + response);
    })
}


