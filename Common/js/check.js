var checked = true;
(function ($) {
    shareConfig();
    $('#searchBtn').click(function () {
        var trueName = trim($("#trueName").val());
        var idCard = trim($("#idCard").val());
        var phone = trim($("#phone").val());
        var openId = getQueryString("openid");
        if (checkLoginForm(trueName, idCard, phone, openId)) {
            login(trueName, idCard, phone, openId);
        }
    })

    //是否同意协议
    $('#checkedBtn').click(function () {
        if (checked) {
            $(this).addClass('unchecked');
        } else {
            $(this).removeClass('unchecked');
        }
        checked = !checked;
    });
})(Zepto);


function checkLoginForm(trueName, idCard, phone, openId) {
    if ("" == openId || openId == undefined || openId == null) {
        layer.open({
            content: '获取不到微信openId，请关闭重新打开链接！',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else if ("" == trueName) {
        layer.open({
            content: '请输入姓名',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else if ("" == phone) {
        layer.open({
            content: '请输入手机号码',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else if (!phoneValidate(phone)) {
        layer.open({
            content: '手机号码不正确',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else if ("" == idCard) {
        layer.open({
            content: '请输入身份证号',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else if (!IdCardValidate(idCard)) {
        layer.open({
            content: '身份证号码不正确',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else if (checked == false) {
        layer.open({
            content: '请已阅读并同意《信用管家数据分析免责协议》',
            className: 'layer-msg',
            time: 2,
            shade: false
        });
        return false;
    } else {
        return true;
    }
}

function phoneValidate(phone) {
    var reg_phone = /^(?:1[3-8]\d|15\d)\d{5}(\d{3}|\*{3})$/;
    if (reg_phone.test(phone)) {
        return true;
    } else {
        return false;
    }
}


/***身份证号码验证start**/
// 加权因子   
var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
// 身份证验证位值.10代表X
var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
function IdCardValidate(idCard) {
    idCard = idCard.trim();               //去掉字符串头尾空格
    if (idCard.length == 15) {
        return isValidityBrithBy15IdCard(idCard);       //进行15位身份证的验证
    } else if (idCard.length == 18) {
        var a_idCard = idCard.split("");                // 得到身份证数组
        if (isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(a_idCard)) {   //进行18位身份证的基本验证和第18位的验证
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**判断身份证号码为18位时最后的验证位是否正确**/
function isTrueValidateCodeBy18IdCard(a_idCard) {
    var sum = 0;                             // 声明加权求和变量
    if (a_idCard[17].toLowerCase() == 'x') {
        a_idCard[17] = 10;                    // 将最后位为x的验证码替换为10方便后续操作
    }
    for (var i = 0; i < 17; i = i + 1) {
        sum += Wi[i] * a_idCard[i];            // 加权求和
    }
    valCodePosition = sum % 11;                // 得到验证码所位置
    if (a_idCard[17] == ValideCode[valCodePosition]) {
        return true;
    } else {
        return false;
    }
}

/***验证18位数身份证号码中的生日是否是有效生日**/
function isValidityBrithBy18IdCard(idCard18) {
    var year = idCard18.substring(6, 10);
    var month = idCard18.substring(10, 12);
    var day = idCard18.substring(12, 14);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 这里用getFullYear()获取年份，避免千年虫问题
    if (temp_date.getFullYear() != parseFloat(year)
        || temp_date.getMonth() != parseFloat(month) - 1
        || temp_date.getDate() != parseFloat(day)) {
        return false;
    } else {
        return true;
    }
}

/***验证15位数身份证号码中的生日是否是有效生日**/
function isValidityBrithBy15IdCard(idCard15) {
    var cArr = idCard15.match(/^[0-9]{15}$/ig);
    if (cArr == null) {
        return false;
    }
    var year = idCard15.substring(6, 8);
    var month = idCard15.substring(8, 10);
    var day = idCard15.substring(10, 12);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
// 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法   
    if (temp_date.getYear() != parseFloat(year)
        || temp_date.getMonth() != parseFloat(month) - 1
        || temp_date.getDate() != parseFloat(day)) {
        return false;
    } else {
        return true;
    }
}

function login(trueName, idCard, phone, openId) {
    layer.open({type: 2, shadeClose: false, shade: true});
    $.ajax({
        url: '/wanghei/checkPrams.ashx',
        data: {
            name: trueName,
            idcard: idCard,
            mobile: phone,
            openId: openId,
            appName: "xygj_web",
            a_or_i: "web",
        },
        dataType: 'json',
        type: 'get',
        success: function (data) {
            console.log(data)
            layer.closeAll();

            if (data.success == true) {
                //已经验证参数成功 跳转到芝麻授权
                window.location.href = '/wanghei/confirmPayment.ashx?orderId=' + data.orderId;
            } else {
                layer.open({
                    content: data.msg,
                    className: 'layer-msg',
                    time: 2,
                    shade: false
                });
            }

        }, error: function () {
            layer.closeAll();
            layer.open({
                content: '网络错误，请稍后重试',
                className: 'layer-msg',
                time: 2,
                shade: false
            });
        }
    });
}

function shareConfig() {
    $.ajax({
        url: '/blacklist/getJsConfig.ashx',
        type: "get",
        dataType: 'json',
        data: {},
        success: function (data) {
            layer.closeAll();
            var obj = data.config;
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: obj.appId, // 必填，公众号的唯一标识
                timestamp: obj.timestamp, // 必填，生成签名的时间戳
                nonceStr: obj.nonceStr, // 必填，生成签名的随机串
                signature: obj.signature,// 必填，签名，见附录1
                jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        }, error: function () {
            layer.closeAll();
            layer.open({
                content: '获取JSCongig配置参数遇到问题，请稍后重试',
                className: 'layer-msg',
                time: 2,
                shade: false
            });
        }
    });
}

function getRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

var num = getRandomNum(1, 4);
var describe = ["我的网贷信用超过85%的人，你呢？？", "想知道你是否在网贷黑名单上？快用这个查", "发现一个查网贷黑名单的神器，速来看看", "厉害了~我的网贷被拒概率居然才20%！你有多少"];
var share = {
    title: '网贷黑名单查询神器',
    des: describe[num - 1],
    imgUrl: 'http://phone.51nbapi.com/query/img/Artboard.jpg',
    link: 'http://' + window.location.host + '/wxweb/share.html?appId=wanghei'
}

wx.ready(function () {
    wx.onMenuShareTimeline({
        title: share.title, // 分享标题
        link: share.link, // 分享链接
        desc: share.des, // 分享描述
        imgUrl: share.imgUrl, // 分享图标
        success: function () {
            shareUpdate();
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
    wx.onMenuShareAppMessage({
        title: share.title, // 分享标题
        link: share.link, // 分享链接
        desc: share.des, // 分享描述
        imgUrl: share.imgUrl, // 分享图标
        success: function () {
            shareUpdate();
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
    wx.onMenuShareQQ({
        title: share.title, // 分享标题
        link: share.link, // 分享链接
        desc: share.des, // 分享描述
        imgUrl: share.imgUrl, // 分享图标
        success: function () {
            shareUpdate();
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
    wx.onMenuShareQZone({
        title: share.title, // 分享标题
        link: share.link, // 分享链接
        desc: share.des, // 分享描述
        imgUrl: share.imgUrl, // 分享图标
        success: function () {
            shareUpdate();
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
});

