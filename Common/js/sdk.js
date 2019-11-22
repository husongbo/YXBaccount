(function () {
    String.prototype.Analyser = function () {
        var text = this;
        var i = 0;
        var ary = [];
        for (i = 0; i < text.length - 1; i++) {
            if (text.charAt(i) === "{" && text.charAt(i + 1) === "{") {
                ary.push(i);
                continue;
            }
            if (text.charAt(i) === "}" && text.charAt(i + 1) === "}") {
                ary.push(i);
                continue;
            }
        }

        var rst = [];
        var strTmp = "";
        var idx = 0;

        for (i = 0; i < ary.length / 2; i++) {

            strTmp = text.substr(idx, ary[i * 2] - idx);
            rst.push({
                'type': '',
                'text': strTmp
            });

            strTmp = text.substr(ary[i * 2] + 2, ary[i * 2 + 1] - ary[i * 2] - 2);
            rst.push({
                'type': '@',
                'text': strTmp
            });
            idx = ary[i * 2 + 1] + 2;
        }
        strTmp = text.substr(idx);
        rst.push({
            'type': '',
            'text': strTmp
        });
        ;

        return rst;
    }

    String.prototype.T = function () {
        if (this === "") {
            return JSON.stringify(arguments);
        }

        var ary = this.Analyser();

        var rst = $$.ArrayToText(ary, arguments)

        return rst;
    }

    String.prototype.C = function (cmd, data) {

        if (typeof(cmd) !== "string") {
            "参数必须是字符串".c("log");
            return;
        }

        var methods = {};
        methods["log"] = function (text, data) {
            console.log(text);
        }

        methods["log_function"] = function (text, data) {

            if (!(typeof data === "function")) {
                "参数必须是function".c("log");
            }
            var tim = new Date().getTime();
            data();
            tim = new Date().getTime() - tim;

            (text + ">用时:{{0}}毫秒!").t(tim).c("log");
        }

        methods["to_array"] = function (text, split_text) {
            return text.split(split_text);
        }

        methods["to_int"] = function (text, data) {
            if ($$.IsNullOrUndefined(data) === true) {
                data = {
                    'default': 0
                };
            }

            if ($$.IsNullOrUndefined(data.default) === true) {
                data.default = 0;
            }
            if (text.trim() === "") {

                return data.default;
            }
            var rst = parseInt(text)
            if (isNaN(rst) === true) {
                return data.default;
            }

            if ($$.IsNullOrUndefined(data.min) === false) {
                rst = Math.max(data.min, rst);
            }

            if ($$.IsNullOrUndefined(data.max) === false) {

                rst = Math.min(data.max, rst);
            }

            return rst;
        }

        methods["to_rect"] = function (text) {
            var rect = {
                'left': 0,
                'top': 0,
                'width': 0,
                'height': 0
            }

            var ary = text.c("to_array", ",");

            if ($$.IsNullOrUndefined(ary[0]) === true) return rect;
            rect.left = ary[0];
            if ($$.IsNullOrUndefined(ary[1]) === true) return rect;
            rect.top = ary[1];
            if ($$.IsNullOrUndefined(ary[2]) === true) return rect;
            rect.width = ary[2];
            if ($$.IsNullOrUndefined(ary[3]) === true) return rect;
            rect.height = ary[3];

            return rect;
        }

        if (!methods[cmd]) {
            "不支持【{{0}}】指令".t(cmd).c("log");
            return;
        }

        return methods[cmd](this, data);
    }

    String.prototype.c = String.prototype.C;
    String.prototype.t = String.prototype.T;
})();

var $$ = new function () {

    // Common########################################
    this.Context = {
        'url': window.location.href,
        'mode': '',
        'IsDebug': false,
        'search': window.location.search,
        'Parameter': {},
        'HasToken': false,
        'token': "",
        'tokenDebug': "00000000",
        'CreateTokenURI': "/Index.ashx?token=new",
        'DebugTokenURI': "/WeChat/CallBackServerPage.aspx",
        'DBConfig': {
            'url': 'http://localhost:57868/DBServer.ashx',
        },
    };
    // Page_Load########################################

    var AnalyzeURL = function (ctx) {
        ctx.search = window.location.search;

        var text = ctx.search.substr(1);

        var ary = text.split("&");
        var rst = {};

        $.each(ary, function (index) {
            var aryTemp = ary[index].split("=");
            if (aryTemp.length === 2) {
                rst[aryTemp[0]] = decodeURI(aryTemp[1]);
            }
        });

        ctx.Parameter = rst;
    }

    /**
     * 页面加载完成后自动调用，可以在页面的JS代码中用自己的方法替换 context：页面的上下文环境
     */
    this.Page_Load = function () {

        if ($$.Context.IsDebug === true) {
            "当前为Debug模式，Context配置信息如下：".c("log");
            $$.Log($$.Context);
        }
    }

    var CheckToken = function () {
        return $$.GetTokenFromServer();
    }

    $(function () {
        $$.LockFont();

        AnalyzeURL($$.Context);

        $$.Context.token = CheckToken();
        if ($$.Context.token === "") {
            if ($$.Context.IsDebug === true) {
                location.href = $$.Context.DebugTokenURI + "?debug=true&token=" + $$.Context.tokenDebug;
            } else {
                location.href = $$.Context.CreateTokenURI + "&CallBack=" + encodeURIComponent($$.CurrentUrlWithoutToken());
            }
        }

        if ($$.Context.Parameter.debug === "true") {
            var title = $(document).attr("title"); //获取title值.
            $(document).attr("title", "【调试】" + title); //修改title值
        }

        $$.Page_Load();

        if ($$.Context.Parameter.back == "index") {
            $.router.back = function () {
                $$.Goto("index");
            }
        }

        $$.CommonEvent();
    })

    // Control########################################
    this.InitControl = function (id, type) {
        var initControlMethods = {};
        $$.Call(initControlMethods, type);
    };

    this.CommonEvent = function () {
        $('.money').each(function () {
            var money = $(this).html();
            money = new Number(money).toFixed(2);
            $(this).html("¥" + money);
        });
    }

    this.LockFont = function () {
        if (typeof(WeixinJSBridge) == "undefined") {
            document.addEventListener("WeixinJSBridgeReady", function (e) {
                setTimeout(function () {
                    WeixinJSBridge.invoke('setFontSizeCallback', {
                        "fontSize": 0
                    }, function (res) {
                        // alert(JSON.stringify(res));
                    });
                }, 0);
            });
        } else {
            setTimeout(function () {
                WeixinJSBridge.invoke('setFontSizeCallback', {
                    "fontSize": 0
                }, function (res) {
                    // alert(JSON.stringify(res));
                });
            }, 0);
        }
    }
};

// Get And Set########################################
$$.GetSetHelper = {};
$$.GetSetHelper.GetSet_ValueData = function (name, property, data) {

    var ary = ['val', 'text', 'html'];
    if (!arguments[2]) {
        if ($.inArray(property, ary) != -1) {
            return $("#" + name)[property]();
        } else {
            return $("#" + name).attr(property);
        }
    } else {
        if ($.inArray(property, ary) != -1) {
            return $("#" + name)[property](data);
        } else {
            return $("#" + name).attr(property, data);
        }
    }
}

$$.GetSetHelper.GetSet_CreateName = function (name, index) {
    if (!index == false) {
        index = "_" + index;
    } else {
        index = "";
    }

    var ary = name.split("__");
    var prop = "text"

    if (ary.length == 1) {
        return {
            'id': name + index,
            'property': prop
        };
    }

    prop = ary[ary.length - 1];
    return {
        'id': name.substr(0, name.length - prop.length - 2) + index,
        'property': prop
    };
}

$$.GetSetHelper.GetSet_GetCount = function (id) {
    var idx = 0;
    while (idx < 10000) {
        if ($("#" + id + "_" + idx).length == 0) {
            return idx;
        }
        idx++;
    }
    return idx;
}

$$.Get = function (obj) {
    $.each(obj, function (key, value) {

        var name = $$.GetSetHelper.GetSet_CreateName(key);
        if (value.constructor == Array) {
            if (value.length == 0) {
                var count = $$.GetSetHelper.GetSet_GetCount(name.id);
                for (var i = 0; i < count; i++) {
                    var itmName = $$.GetSetHelper.GetSet_CreateName(key, i);
                    var val = $$.GetSetHelper.GetSet_ValueData(itmName.id, itmName.property);
                    value.push(val);
                }
            } else {
                $$.Log(key + "的值只能是空数组或包含一个元素的对象数组！");
            }
        } else if (value.constructor == Object) {
            $$.Get(value);
            obj[key] = value;
        } else if (value.constructor == Function) {
            obj[key] = value();
        } else {
            obj[key] = $$.GetSetHelper.GetSet_ValueData(name.id, name.property);
        }
    });
}

$$.Set = function (obj) {
    $.each(obj, function (key, value) {
        var name = $$.GetSetHelper.GetSet_CreateName(key);
        if (value.constructor == Array) {
            for (var i = 0; i < value.length; i++) {
                var itmName = $$.GetSetHelper.GetSet_CreateName(key, i);
                $$.GetSetHelper.GetSet_ValueData(itmName.id, itmName.property, value[i]);
            }
        } else if (value.constructor == Object) {
            $$.Set(value);
        } else if (value.constructor == Function) {
            value();
        } else {
            if (value != null) {
                obj[key] = $$.GetSetHelper.GetSet_ValueData(name.id, name.property, value);
            }
        }
    });
}

$$.isJSON = function (obj) {
    var isjson =
        typeof(obj) == "object" &&
        Object.prototype.toString.call(obj).toLowerCase() == "[object object]" &&
        !obj.length;
    return isjson;
}

$$.Output = function (msg) {
    if ($("#debug_output").length != 0) {
        $("#debug_output").text(msg);
    }

    msg.c("log");
}

$$.Log = function (msg) {

    var logCommand = {};

    logCommand.$Init = function () {
        $$.Output("########Log Start########");
    }

    logCommand.$StartTime = function () {
        $$.__log_last_time = new Date();
    }

    logCommand.$EndTime = function () {
        var ms = (new Date()).getTime() - $$.__log_last_time.getTime();
        $$.Output("用时：" + ms);
    }

    if (logCommand[msg]) {
        logCommand[msg]();
        return;
    }

    if ($$.isJSON(msg) == true) {
        $$.Output(JSON.stringify(msg));
        return;
    }

    if (!msg && msg != 0 && msg != "") {
        $$.Output("msg is Undefined!");
        return;
    }

    $$.Output(JSON.stringify(msg));
};

$$.FindData = function (param, name) {

    if (typeof(param[0]) == "object") {
        var ary = name.split(".");
        var rst = param[0];

        for (var i = 0; i < ary.length; i++) {
            if (ary[i] in rst) {
                rst = rst[ary[i]];
            } else {
                return "error:" + name;
            }

        }
        return rst;
    } else {
        return param[parseInt(name)];
    }
}

$$.ArrayToText = function (ary, param) {
    var rst = "";

    for (var i = 0; i < ary.length; i++) {
        if (ary[i].type == "") {
            rst += ary[i].text;
        } else {

            rst += $$.FindData(param, ary[i].text);
        }
    }

    return rst;

}

$$.TemplateCatch = {};

$$.GetTemplate = function (id, isArray, tmpl) {
    var str = "";

    if (tmpl == undefined || tmpl == null) {

        if (isArray == true) {
            tmpl = "_Template";
        } else {
            tmpl = "";
        }

    }

    var name = "__#" + id + tmpl;

    if (!$$.TemplateCatch[name] == false) {
        return $$.TemplateCatch[name];
    }

    if (isArray == true) {
        str = $("#" + id + tmpl).html();
    } else {
        str = $("#" + id + tmpl)[0].outerHTML;
    }

    // TemplateCatch[name] = $$.CreateTemplate(str);
    $$.TemplateCatch[name] = str.Analyser();

    return $$.TemplateCatch[name];
}

$$.Fill = function (id, source, tmpl) {
    $(id).each(function () {

        var data = source;
        if ($.isFunction(source) == true) {
            data = source();
        }

        var str = "";
        var ary;

        if ($.isArray(data) == true) {
            ary = $$.GetTemplate(this.id, true, tmpl);
            for (var i = 0; i < data.length; i++) {
                $(this).append($$.ArrayToText(ary, [data[i]]));
            }

        } else {
            ary = $$.GetTemplate(this.id, false, tmpl);
            this.outerHTML = $$.ArrayToText(ary, [data]);
        }

    })
};

$$.Refill = function (id, source, tmpl) {
    $(id).empty();
    $$.Fill(id, source, tmpl);
};

$$.AsyncCall = function (callback) {
    var layerId = layer.open({
        type: 2
    });
    setTimeout(function () {
        callback();
        layer.close(layerId);
    }, 0);
}

$$.Layout = function (id) {
    var CreateGridLength = function (text) {
        var rst = {
            'IsStar': false,
            'IsAbsolute': false,
            'Value': 0
        };

        if (text.length == 0) {
            rst.IsAbsolute = true;
            rst.Value = 0;
            return rst;
        }
        var c = text.charAt(0);
        if (c == "*") {
            rst.IsStar = true;
            if (text.length == 1) {
                rst.Value = 1;
            } else {
                rst.Value = parseInt(text.substr(1));
            }

        } else {
            rst.IsAbsolute = true;
            rst.Value = parseInt(text);
        }
        // console.log(JSON.stringify(rst));
        return rst;
    }

    var CalculateLength = function (w, ary) {
        var aryGridLength = new Array();
        var sumStar = 0;
        var sumAbsolute = 0;
        $(ary).each(function () {
            var gl = CreateGridLength(this);

            if (gl.IsAbsolute == true) {
                sumAbsolute += gl.Value;
            } else if (gl.IsStar == true) {
                sumStar += gl.Value;
            }

            aryGridLength.push(gl);
        })

        var aryRst = new Array();
        var sumStarWidth = w - sumAbsolute;

        $(aryGridLength).each(function () {
            if (this.IsAbsolute) {
                aryRst.push(this.Value);
            } else if (this.IsStar) {
                var val = sumStarWidth * this.Value / sumStar;
                aryRst.push(val);
            }
        })

        var left = 0;
        for (var i = 1; i < aryRst.length; i++) {
            aryRst[i] = aryRst[i] + aryRst[i - 1];
        }

        return aryRst;
    }

    var CalculateRect = function (cell, columns, rows) {
        var column = CalculateStartEnd(columns, cell.Column, cell.ColumnSpan);
        var row = CalculateStartEnd(rows, cell.Row, cell.RowSpan);

        return {
            'Left': column.Start,
            'Top': row.Start,
            'Width': column.Length,
            'Height': row.Length
        };
    }

    var CalculateStartEnd = function (ary, start, len) {

        var s = (start == 0) ? 0 : ary[start - 1];
        var l = ary[start + len - 1] - s;
        return {
            'Start': s,
            'Length': l
        };
    }

    var layout_method = function (obj) {

        var jo = $(obj);
        // jo.css("position","relative");
        var w = jo.width();
        var h = jo.height();
        var tmp = jo.attr("grid_rows");
        if (tmp == undefined || tmp == "") {
            tmp = "*"
        }

        var rows = tmp.split(",");
        var aryRow = CalculateLength(h, rows);

        tmp = jo.attr("grid_columns");
        if (tmp == undefined || tmp == "") {
            tmp = "*,*,*,*,*,*,*,*,*,*,*,*"
        }

        var columns = tmp.split(",");
        var aryColumn = CalculateLength(w, columns);

        var GetValue = function (obj, min, max) {

            var val = 0;

            if (typeof(obj) == 'string' && obj.constructor == String) {
                val = parseInt(obj);
            }

            if ($.isNumeric(val) == false) {
                return 0;
            }

            val = Math.max(min, val);
            val = Math.min(max, val);

            return val;
        }

        jo.children().each(function () {
            var joItem = $(this);
            var ary = joItem.attr("grid_cell").split(",");

            var cell = {
                'Column': GetValue(ary[0], 0, aryColumn.length - 1),
                'Row': GetValue(ary[1], 0, aryRow.length - 1),
                'ColumnSpan': GetValue(ary[2], 1, aryColumn.length),
                'RowSpan': GetValue(ary[3], 1, aryRow.length)
            };
            // alert(JSON.stringify(cell));
            var rect = CalculateRect(cell, aryColumn, aryRow);

            joItem.css("position", "absolute");
            joItem.css("left", rect.Left);
            joItem.css("top", rect.Top);
            joItem.css("width", rect.Width);
            joItem.css("height", rect.Height);

            // console.log(JSON.stringify(rect));
        });

    };

    $(id).each(function () {
        layout_method(this);
    });
};

var __Animation = {
    'IsReady': false,
    'AnimationObjects': {},
    'IsAnimationRun': false,
    'IDCount': 0,
    'RunAnimation': function () {
        var count = 0;

        $.each(__Animation.AnimationObjects, function (key, value) {
            count++;
            value.RunTime = (new Date()).getTime() - value.StartTime;
            value.Func(value);
            value.RunCount++;
            if (value.RunFlag == false) {
                delete __Animation.AnimationObjects[key];
            }
        })
        // $$.Log(count);
        if (count == 0) {
            __Animation.IsAnimationRun = false
            return;
        }

        var id = window.requestAnimationFrame(__Animation.RunAnimation);
    }
};

$$.AddAnimation = function (param) {
    if (__Animation.IsReady == false) {
        var lastTime = 0;
        var vendors = ['webkit', 'moz', 'ms', 'o'];
        window.requestAnimationFrame = window.requestAnimationFrame;
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        __Animation.IsReady = true;

        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    __Animation.IDCount++;
    var id = "__Animation__" - __Animation.IDCount;
    var func = "";
    if ($.isFunction(param)) {
        func = param;
    } else {
        id = param.id;
        func = param.func;
    }

    __Animation.AnimationObjects[param.id] = {
        'ID': id,
        'Func': func,
        'RunFlag': true,
        'StartTime': (new Date()).getTime(),
        'RunCount': 0
    };

    if (__Animation.IsAnimationRun == false) {
        __Animation.RunAnimation();
        __Animation.IsAnimationRun = true;
    }

    return id;
}

$$.CheckParameter = function (para, name, def) {
    if (!para[name]) {
        if (!def) {
            $$.Log("参数【{{name}}】未设定！".t({
                'name': name
            }));
            return false;
        }
        $$.Log("参数【{{name}}】使用了默认值【{{def}}】！".t({
            'name': name,
            'def': def
        }));
    }
    return true;
}

$$.GetTokenFromServer = function () {
    var token = "";
    $.ajax({
        type: "post",
        url: "/WeChat/GetToken.ashx",
        async: false,
        success: function (data) {
            token = data;
        }
    });
    return token;
}

/**
 *
 * @param {String}
 *            page 跳转页面
 * @param {Object}
 *            getData GET 参数
 * @param {Object}
 *            postData POST 参数 未使用
 */

$$.CurrentUrlWithoutToken = function () {
    var url = window.location.href.split("?")[0];
    var search = window.location.search.slice(1);
    var ary = search.split("&");
    var split = '?';
    if (ary != "") {
        for (var key in ary) {
            if (ary[key].startsWith("token=")) {
                continue;
            }
            url += split;
            url += ary[key];
            split = '&';
        }
    }
    return url;
}

/**
 *
 * @param {String}
 *            page 跳转页面
 * @param {Object}
 *            getData GET 参数
 * @param {Object}
 *            postData POST 参数 未使用
 */
$$.Goto = function (page, getData, postData) {
    //	var url = '../' + page + '/' + page + '.html';
    var url = page + ".html";
    url += '?timestamp=' + new Date().getTime();
    if (getData) {
        var param = $$.getSearch(getData);
        url += '&' + param;
    }

    window.location.href = url;
}

/**
 * JSON to search
 * @param data
 * @returns {string}
 */
$$.getSearch = function (data) {
    var search = "";
    if (data instanceof String || typeof data == 'string') {
        search = data;
    } else if (data instanceof Object) {
        var param = [];
        for (var key in data) {
            param.push(key + '=' + data[key]);
        }
        search = param.join('&');
    }
    return search;
}

$$.Call = function (action, parameter, func) {
    var token = encodeURIComponent($$.Context.token);
    if (token == "") {
        token = "00000000";
    }
    $.ajax({
        type: "post",
        url: "/WeChat/WeChatDataProcess.ashx?token={{0}}&action={{1}}".t(
            token, action
        ),
        data: parameter,
        async: false,
        success: function (data) {
            var json = $.parseJSON(data);
            func(json);
        }
    });
}

$$.DB = {};

// 在尾部追加一个元素，不论是堆栈和队列均可使用
// 示例：单表主Key查询：
// 查询 M1001_USER，条件为M1001_ID = 1【M1001_USER/1】
// 生成SQL：SELECT * FROM M1001_USER WHERE M1001_USER.M1001_ID = 1
// 示例：单表条件查询：
// 查询 M1001_USER，条件为M1001_NAME = '张伟' OR M1001_ID < 1000【M1001_USER/M1001_NAME =
// '张伟' OR M1001_ID < 1000】
// 生成SQL：sql":"SELECT * FROM M1001_USER WHERE M1001_NAME = '张伟' OR M1001_ID <
// 1000

$$.DB.Push = function (param) {

}

// 调用后台自定义方法
$$.DB.Call = function (param) {
    // 要调用的方法名称
    if ($$.CheckParameter(param, "name") == false) return;
    // 参数列表
    if ($$.CheckParameter(param, "data") == false) return;
}

// 访问数据库
$$.DB.REST = function (method, rest, data, func) {
    var ary = rest.split("/");

    var param = {
        'token': $$.Context.token,
        'var': '1.0',
        'method': method,
        'rest': rest,
        'data': data,
        'debug': $$.Context.IsDebug,
    };

    var isAsync = !func;
    var rst = null;
    $.ajax({
        type: "POST",
        url: '../Common/php/REST.php',
        data: param,
        success: function (data) {
            rst = data;
            if (isAsync == false) {
                func(data);
            }
        },
        dataType: 'JSONP',
        async: !isAsync,
    });

    return rst;
}

$$.IsNullOrUndefined = function (pValue) {
    if (pValue == undefined) return true;
    if (pValue == null) return true;
    return false;
};

$$.Process = function (pFunc) {
    $.showPreloader("正在拼命加载中！");

    $.ajax({
        type: "POST",
        url: '/APP/Common/CSharp/TokenValidation.ashx?token=' + $$.Context.token,
        success: function (data) {
            pFunc(data);
            $.hidePreloader();
        },
    });
};

$$.IsEmptyString = function (str) {
    if ($$.IsNullOrUndefined(str) == true) {
        return true;
    }
    if (typeof str == 'string' && str.constructor == String) {
        if (str.trim() == "") {
            return true;
        } else {
            return false;
        }
    }
}

$$.GetJSSDKParameter = function () {
    var url = "/WeChat/GetJSSDKParameter.ashx";
    var data = {};
    data.URL = window.location.href;
    var rst = null;
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (result) {
            rst = JSON.parse(result);
        },
        async: false
    });

    return rst;
}

$$.GetWxJsApiParam = function (pData, callbackFunc) {

    var url = "/App/Common/CSharp/Pay/GetWxJsApiParam.ashx";
    var data = "";

    if ($$.IsNullOrUndefined(pData) === false) {
        data = JSON.stringify(pData);
    }

    var layerId = layer.open({
        type: 2
    });
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (result) {
            if (result.retcode == "SUCCESS") {
                var payInfo = JSON.parse(result.payinfo);
                callbackFunc(payInfo);
            } else {
                result = JSON.stringify(result);
            }
        },
        complete: function () {
            layer.close(layerId);
        },
        dataType: 'json'
    });
}

$$.FileSystem = {
    Config: {
        ProcessURL: "/App/Common/CSharp/FileSystemAccess.ashx",
    },
    Call: function (pData, pFunc) {
        var url = this.Config.ProcessURL;

        var data = "";
        if ($$.IsNullOrUndefined(pData) === false) {
            data = JSON.stringify(pData);
        }
        var rst = null;
        $$.Log(url);
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            success: function (data) {
                if (data.error == "-1") {
                    location.href = $$.Context.CreateTokenURI + "&CallBack=" + encodeURIComponent($$.CurrentUrlWithoutToken());
                }
                if (pFunc == undefined) {
                    rst = data.result;
                } else {
                    pFunc(data.result);
                }

            },
            dataType: 'json',
            async: !(pFunc === undefined)
        });

        return rst;
    },
    GetDirectories: function (pPath) {
        return this.CallCommand("GetDirectories", pPath);
    },
    GetFiles: function (pPath) {
        return this.CallCommand("GetFiles", pPath)[0];
    },
    RemoveFile: function (pPath) {
        return this.CallCommand("RemoveFile", pPath);
    },
    CreateCommodityImageCache: function (pPath) {
        return this.CallCommand("CreateCommodityImageCache", pPath);
    },
    RemoveDirectory: function (pPath) {
        return this.CallCommand("RemoveDirectory", pPath);
    },
    GetFileContent: function (pPath, pDefaultContent) {
        return this.CallCommand("GetFileContent", pPath, pDefaultContent);
    },
    SetFileContent: function (pPath, pContent) {
        return this.CallCommand("SetFileContent", pPath, pContent);
    },
    FileExists: function (pPath) {
        return this.CallCommand("FileExists", pPath);
    },
    DirectoryExists: function (pPath) {
        return this.CallCommand("DirectoryExists", pPath);
    },
    CreateCommand: function (pMethod, pPath, pContent) {
        return {
            method: pMethod,
            path: pPath,
            content: pContent
        };
    },
    Commbit: function (pCommandArray, pFunc) {
        var rst = this.Call(pCommandArray, pFunc);
        return rst;
    },
    CallCommand: function (pMethod, pPath, PContent, pFunc) {
        var cmd = this.CreateCommand(pMethod, pPath, PContent);
        var ary = new Array();
        ary.push(cmd);
        return this.Commbit(ary, pFunc);
    }
};

$$.IsSuperUser = function (id, pwd) {
    var date = new Date();
    var str = "";
    str = str + date.getYear().toString().substr(1, 2) % 7;
    str = str + (date.getMonth() + 1) % 7;
    str = str + date.getDate() % 7;
    str = str + date.getHours() % 7;
    if (pwd === str) {
        return true;
    }
    return false;
};

$$.GetBaseURL = function () {
    var dynamicName = "";
    if (sessionStorage.dynamicName) {
        dynamicName = sessionStorage.dynamicName;
    } else if (sessionStorage.dynamicName === undefined) {
        dynamicName = getDynamicName();
    }

    var projectName = getProjectName();
    if (sessionStorage.projectName) {
        projectName = sessionStorage.projectName;
    }

    function getDynamicName() {
        var pathName = window.document.location.pathname;
        var dame = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

        return dame;
    }

    function getProjectName() {
        var pathName = window.document.location.pathname;
        pathName = pathName.replace(dynamicName, "");
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

        return projectName;
    }

    return dynamicName + projectName;
}

$$.CopyObjectProperty = function (src, des) {
    $.each(src, function (key) {
        des[key] = src[key];
    });
}

$$.Page = {
    Create: function (obj) {
        obj.Show = function (data) {
            var tmpl = $("#" + this.ID + "_Template").html();

            if ($$.IsNullOrUndefined(this.Properties) == true) {
                this.Properties = {};
            }

            if ($$.IsNullOrUndefined(data) == false) {
                $$.CopyObjectProperty(data, this.Properties);
            }

            var html = tmpl.t(this.Properties);

            $("#" + this.ID).append(html);
            if ($$.IsNullOrUndefined(this.Load) == false) {
                this.Load(this.Properties);
            }
        }

        this[obj.ID] = obj;
    }
};

$$.Template = {
    Template: {},
    Load: function (url) {

        $.ajax({
            type: "get",
            "url": url,
            async: false,
            success: function (rst) {
                var start = rst.indexOf("<!--TemplateDefineStart-->");
                start += "<!--TemplateDefineStart-->".length;
                var end = rst.indexOf("<!--TemplateDefineEnd-->");

                var tmpl = rst.substr(start, end - start);
                $("head").append(tmpl);
                "模板加载成功！".c("log");
            }

        });
    }
};

/**
 * 动态引入html文件
 * @param {Object} id DOM节点ID
 * @param {Object} html  html文件
 * @param {Function} func  回掉方法
 */
$$.LoadHTML = function (id, html, func) {
    $(id).load(html);
}

/**
 * 回退/关闭后回到主页
 */
$$.Back = function () {
    if (window.history.length > 0) {
        window.location.href = document.referrer;
    } else {
        this.Close();
    }
}

/**
 * 关闭后回到主页
 */
$$.Close = function () {
    window.location.href = "http://myhome";
}

/**
 * 菜单事件
 */
$$.Menu = function () {

}

$$.CreatePage = function (obj) {
    return obj;
}

/**
 * 解析url地址
 */
$$.getParameterValue = function () {
    var name, value;
    var str = location.href;
    var num = str.indexOf("?")
    str = str.substr(num + 1);
    var arr = str.split("&");
    var rst = {};
    for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            rst[name] = value;
        }
    }
    return rst
}