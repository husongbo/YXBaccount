(function() {
	/**
	 * 模板解析
	 * @returns {Array} 返回模板替换数组
	 * @constructor
	 */
	String.prototype.Analyser = function() {
		var text = this;
		var ary = [];
		for(var i = 0; i < text.length - 1; i++) {
			if(text.charAt(i) == "{" && text.charAt(i + 1) == "{") {
				ary.push(i);
				continue;
			}
			if(text.charAt(i) == "}" && text.charAt(i + 1) == "}") {
				ary.push(i);
				continue;
			}
		}

		var rst = [];
		var strTmp = "";
		var idx = 0;

		for(var i = 0; i < ary.length / 2; i++) {

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

		return rst;
	}

	/**
	 *
	 * @constructor
	 */
	String.prototype.T = function() {
		if(this == "") {
			return JSON.stringify(arguments);
		}

		var ary = this.Analyser();

		var rst = $$.ArrayToText(ary, arguments)

		return rst;
	}

	/**
	 *
	 * @param cmd 指令
	 * @param data 数据
	 * @returns {*}
	 * @constructor
	 */
	String.prototype.C = function(cmd, data) {

		if(typeof(cmd) != "string") {
			"参数必须是字符串".c("log");
			return;
		}

		var methods = {};
		methods["log"] = function(text, data) {
			console.log(text);
		}

		methods["log_function"] = function(text, data) {

			if(!(typeof data === "function")) {
				"参数必须是function".c("log");
			}
			var tim = new Date().getTime();
			data();
			tim = new Date().getTime() - tim;

			(text + ">用时:{{0}}毫秒!").t(tim).c("log");
		}

		methods["to_array"] = function(text, split_text) {
			return text.split(split_text);
		}

		methods["to_int"] = function(text, data) {
			if(data == undefined) {
				data = {
					'default': 0
				};
			}

			if(data.default == undefined) {
				data.default = 0;
			}
			if(text.trim() == "") {

				return data.default;
			}
			var rst = parseInt(text)
			if(rst == NaN) {
				return data.default;
			}

			if(data.min != undefined) {
				rst = Math.max(data.min, rst);
			}

			if(data.max != undefined) {

				rst = Math.min(data.max, rst);
			}

			return rst;
		}

		methods["to_rect"] = function(text) {
			var rect = {
				'left': 0,
				'top': 0,
				'width': 0,
				'height': 0
			}

			var ary = text.c("to_array", ",");

			if(ary[0] == undefined) return rect;
			rect.left = ary[0];
			if(ary[1] == undefined) return rect;
			rect.top = ary[1];
			if(ary[2] == undefined) return rect;
			rect.width = ary[2];
			if(ary[3] == undefined) return rect;
			rect.height = ary[3];

			return rect;
		}

		if(!methods[cmd]) {
			"不支持【{{0}}】指令".t(cmd).c("log");
			return;
		}

		return methods[cmd](this, data);
	}

	String.prototype.c = String.prototype.C;
	String.prototype.t = String.prototype.T;
})();

var $$ = new function() {
	
	this.timeout = 30000; // ajax 超时时间

	// Common########################################
	this.Context = {
		'url': window.location.href,
		'mode': '',
		'IsDebug': true,
		'search': window.location.search,
		'Parameter': {},
		'HasToken': false,
		'token': "",
		//		'CreateTokenURI': "CreateToken.html?token=new",
		//		'DBConfig': {
		//			'url': 'http://localhost:57868/DBServer.ashx',
		//		},
	};
	// Page_Load########################################

	var AnalyzeURL = function(ctx) {

		ctx.search = window.location.search;
		var text = ctx.search.substr(1);
		var ary = text.split("&");
		var rst = {};
		$.each(ary, function(index) {
			var aryTemp = ary[index].split("=");
			if(aryTemp.length == 2) {
				rst[aryTemp[0]] = decodeURI(aryTemp[1]);

			}
		});

		ctx.Parameter = rst;
	}

	/**
	 * 页面加载完成后自动调用，可以在页面的JS代码中用自己的方法替换 context：页面的上下文环境
	 */
	this.Page_Load = function() {

		if($$.Context.IsDebug == true) {
			"当前为Debug模式，Context配置信息如下：".c("log");
			$$.Log($$.Context);
		}
	}

	var CheckToken = function() {
		if(!$$.Context.Parameter.token) {
			return "";
		} else {
			return $$.Context.Parameter.token.trim();
		}
	}
	
	var AddToken = function(token) {
		$$.Context.Parameter['token'] = token;
		var search = '?' + $$.getSearch($$.Context.Parameter);
		location.search = search;
	}

	$(function() {
		AnalyzeURL($$.Context);
		$$.Page_Load();
	})

	// Control########################################
	this.InitControl = function(id, type) {
		var initControlMethods = {};
		$$.Call(initControlMethods, type);
	};

};

// Get And Set########################################
$$.GetSetHelper = {};
$$.GetSetHelper.GetSet_ValueData = function(name, property, data) {

	var ary = ['val', 'text', 'html'];
	if(arguments.length != 3) {
		if($.inArray(property, ary) != -1) {
			return $("#" + name)[property]();
		} else {
			return $("#" + name).attr(property);
		}
	} else {
		if($.inArray(property, ary) != -1) {
			return $("#" + name)[property](data);
		} else {
			return $("#" + name).attr(property, data);
		}
	}
}

$$.GetSetHelper.GetSet_CreateName = function(name, index) {
	if(index == 0 || !index == false) {
		index = "_" + index;
	} else {
		index = "";
	}

	var ary = name.split("__");
	var prop = "text"

	if(ary.length == 1) {
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

$$.GetSetHelper.GetSet_GetCount = function(id) {
	var idx = 0;
	while(idx < 10000) {
		if($("#" + id + "_" + idx).length == 0) {
			return idx;
		}
		idx++;
	}
	return idx;
}

$$.Get = function(obj) {
	$.each(obj, function(key, value) {

		var name = $$.GetSetHelper.GetSet_CreateName(key);
		if(value.constructor == Array) {
			if(value.length == 0) {
				var count = $$.GetSetHelper.GetSet_GetCount(name.id);
				for(var i = 0; i < count; i++) {
					var itmName = $$.GetSetHelper.GetSet_CreateName(key, i);
					var val = $$.GetSetHelper.GetSet_ValueData(itmName.id, itmName.property);
					value.push(val);
				}
			} else {
				$$.Log(key + "的值只能是空数组或包含一个元素的对象数组！");
			}
		} else if(value.constructor == Object) {
			$$.Get(value);
			obj[key] = value;
		} else if(value.constructor == Function) {
			obj[key] = value();
		} else {
			obj[key] = $$.GetSetHelper.GetSet_ValueData(name.id, name.property);
		}
	});
}

$$.Set = function(obj) {
	$.each(obj, function(key, value) {
		var name = $$.GetSetHelper.GetSet_CreateName(key);
		if(value.constructor == Array) {
			for(var i = 0; i < value.length; i++) {
				var itmName = $$.GetSetHelper.GetSet_CreateName(key, i);
				$$.GetSetHelper.GetSet_ValueData(itmName.id, itmName.property, value[i]);
			}
		} else if(value.constructor == Object) {
			$$.Set(value);
		} else if(value.constructor == Function) {
			value();
		} else {
			if(value != null) {
				obj[key] = $$.GetSetHelper.GetSet_ValueData(name.id, name.property, value);
			}
		}
	});
}

$$.isJSON = function(obj) {
	var isjson =
		typeof(obj) == "object" &&
		Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
	return isjson;
}

$$.Output = function(msg) {
	if($("#debug_output").length != 0) {
		$("#debug_output").text(msg);
	}

	msg.c("log");
}

$$.Log = function(msg) {

	var logCommand = {};

	logCommand.$Init = function() {
		$$.Output("########Log Start########");
	}

	logCommand.$StartTime = function() {
		$$.__log_last_time = new Date();
	}

	logCommand.$EndTime = function() {
		var ms = (new Date()).getTime() - $$.__log_last_time.getTime();
		$$.Output("用时：" + ms);
	}

	if(logCommand[msg]) {
		logCommand[msg]();
		return;
	}

	if($$.isJSON(msg) == true) {
		$$.Output(JSON.stringify(msg));
		return;
	}

	if(!msg && msg != 0 && msg != "") {
		$$.Output("msg is Undefined!");
		return;
	}

	$$.Output(JSON.stringify(msg));
};

$$.FindData = function(param, name) {

	if(typeof(param[0]) == "object") {
		var ary = name.split(".");
		var rst = param[0];

		for(var i = 0; i < ary.length; i++) {
			if(ary[i] in rst) {
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

$$.ArrayToText = function(ary, param) {
	var rst = "";

	for(var i = 0; i < ary.length; i++) {
		if(ary[i].type == "") {
			rst += ary[i].text;
		} else {

			rst += $$.FindData(param, ary[i].text);
		}
	}

	return rst;

}

$$.TemplateCatch = {};

$$.GetTemplate = function(id, isArray) {
	var str = "";
	var name = "__#" + id + "_Template";

	if(!$$.TemplateCatch[name] == false) {
		return $$.TemplateCatch[name];
	}

	if(isArray == true) {
		str = $("#" + id + "_Template").html();
	} else {
		str = $("#" + id)[0].outerHTML;
	}

	// TemplateCatch[name] = $$.CreateTemplate(str);
	$$.TemplateCatch[name] = str.Analyser();

	return $$.TemplateCatch[name];
}

$$.Fill = function(id, source) {

	$(id).each(function() {

		var data = source;

		if($.isFunction(source) == true) {
			data = source();
		}

		var str = "";
		var ary;

		if($.isArray(data) == true) {

			ary = $$.GetTemplate(this.id, true);
			for(var i = 0; i < data.length; i++) {
				$(this).append($$.ArrayToText(ary, [data[i]]));
			}

		} else {
			ary = $$.GetTemplate(this.id, false);
			this.outerHTML = $$.ArrayToText(ary, [data]);

		}

	})
};
$$.Update = function(id, source) {
	$(id).empty();
	$$.Fill(id, source);
};

$$.Layout = function(id) {
	var CreateGridLength = function(text) {
		var rst = {
			'IsStar': false,
			'IsAbsolute': false,
			'Value': 0
		};

		if(text.length == 0) {
			rst.IsAbsolute = true;
			rst.Value = 0;
			return rst;
		}
		var c = text.charAt(0);
		if(c == "*") {
			rst.IsStar = true;
			if(text.length == 1) {
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

	var CalculateLength = function(w, ary) {
		var aryGridLength = new Array();
		var sumStar = 0;
		var sumAbsolute = 0;
		$(ary).each(function() {
			var gl = CreateGridLength(this);

			if(gl.IsAbsolute == true) {
				sumAbsolute += gl.Value;
			} else if(gl.IsStar == true) {
				sumStar += gl.Value;
			}

			aryGridLength.push(gl);
		})

		var aryRst = new Array();
		var sumStarWidth = w - sumAbsolute;

		$(aryGridLength).each(function() {
			if(this.IsAbsolute) {
				aryRst.push(this.Value);
			} else if(this.IsStar) {
				var val = sumStarWidth * this.Value / sumStar;
				aryRst.push(val);
			}
		})

		var left = 0;
		for(var i = 1; i < aryRst.length; i++) {
			aryRst[i] = aryRst[i] + aryRst[i - 1];
		}

		return aryRst;
	}

	var CalculateRect = function(cell, columns, rows) {
		var column = CalculateStartEnd(columns, cell.Column, cell.ColumnSpan);
		var row = CalculateStartEnd(rows, cell.Row, cell.RowSpan);

		return {
			'Left': column.Start,
			'Top': row.Start,
			'Width': column.Length,
			'Height': row.Length
		};
	}

	var CalculateStartEnd = function(ary, start, len) {

		var s = (start == 0) ? 0 : ary[start - 1];
		var l = ary[start + len - 1] - s;
		return {
			'Start': s,
			'Length': l
		};
	}

	var layout_method = function(obj) {

		var jo = $(obj);
		// jo.css("position","relative");
		var w = jo.width();
		var h = jo.height();
		var tmp = jo.attr("grid_rows");
		if(tmp == undefined || tmp == "") {
			tmp = "*"
		}

		var rows = tmp.split(",");
		var aryRow = CalculateLength(h, rows);

		tmp = jo.attr("grid_columns");
		if(tmp == undefined || tmp == "") {
			tmp = "*,*,*,*,*,*,*,*,*,*,*,*"
		}

		var columns = tmp.split(",");
		var aryColumn = CalculateLength(w, columns);

		var GetValue = function(obj, min, max) {

			var val = 0;

			if(typeof(obj) == 'string' && obj.constructor == String) {
				val = parseInt(obj);
			}

			if($.isNumeric(val) == false) {
				return 0;
			}

			val = Math.max(min, val);
			val = Math.min(max, val);

			return val;
		}

		jo.children().each(function() {
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

	$(id).each(function() {
		layout_method(this);
	});
};

var __Animation = {
	'IsReady': false,
	'AnimationObjects': {},
	'IsAnimationRun': false,
	'IDCount': 0,
	'RunAnimation': function() {
		var count = 0;

		$.each(__Animation.AnimationObjects, function(key, value) {
			count++;
			value.RunTime = (new Date()).getTime() - value.StartTime;
			value.Func(value);
			value.RunCount++;
			if(value.RunFlag == false) {
				delete __Animation.AnimationObjects[key];
			}
		})
		// $$.Log(count);
		if(count == 0) {
			__Animation.IsAnimationRun = false
			return;
		}

		var id = window.requestAnimationFrame(__Animation.RunAnimation);
	}
};

$$.AddAnimation = function(param) {
	if(__Animation.IsReady == false) {
		var lastTime = 0;
		var vendors = ['webkit', 'moz', 'ms', 'o'];
		window.requestAnimationFrame = window.requestAnimationFrame;
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];

			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		__Animation.IsReady = true;

		if(!window.requestAnimationFrame) window.requestAnimationFrame = function(callback) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	__Animation.IDCount++;
	var id = "__Animation__" - __Animation.IDCount;
	var func = "";
	if($.isFunction(param)) {
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

	if(__Animation.IsAnimationRun == false) {
		__Animation.RunAnimation();
		__Animation.IsAnimationRun = true;
	}

	return id;
}

$$.CheckParameter = function(para, name, def) {
	if(!para[name]) {
		if(!def) {
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

/**
 *
 * @param {String}
 *            page 跳转页面
 * @param {Object}
 *            getData GET 参数
 * @param {Object}
 *            postData POST 参数 未使用
 */
$$.Goto = function(page, getData, postData) {
	var url = '../' + page + '/' + page + '.html';
	url += '?token=' + $$.Context.token;
	if(getData) {
		var param = $$.getSearch(getData);
		url += '&' + param;
	}

	window.location.href = url;
}

/**
 * 跳转远程页面
 * @param url
 * @param userId 用户id
 * @param page	页面编码
 * @param getData get参数胡
 * @param postData
 * @constructor
 */
$$.GotoCors = function(url, userId, pagePrefix, page, getData, postData) {
    var url = url + userId + "/" + pagePrefix + "/" + page + "/" + page + ".html";
    url += '?token=' + $$.Context.token;
    if(getData) {
        var param = $$.getSearch(getData);
        url += '&' + param;
    }
    window.location.href = url;
}

/**
 * 通过蛮牛云跳转至果业系统页面
 * @param userId 用户id
 * @param page	页面编码
 * @param getData get参数胡
 * @param postData
 * @constructor
 */
$$.GotoManNiuGySys = function(userId, page, getData, postData) {
    $$.GotoCors($$.URL.MAN_NIU_URL, userId, "GySys/gysys", page, getData, postData);
}

/**
 * 跳转至本地订单页面
 * @param page	页面编码
 * @param getData get参数胡
 * @param postData
 * @constructor
 */
$$.GotoOrder = function(page, getData, postData) {
    $$.GotoCors($$.URL.LOCAL_HOST, $$.GetUserId(), "OrderFpp/order", page, getData, postData);
}

/**
 * 跳转至本地商城页面
 * @param page	页面编码
 * @param getData get参数胡
 * @param postData
 * @constructor
 */
$$.GotoLocalGySys = function(page, getData, postData) {
    $$.GotoCors($$.URL.LOCAL_HOST, $$.GetUserId(), "GySys/gysys", page, getData, postData);
}

/**
 * 通过蛮牛云跳转至物流页面
 * @param userId 用户id
 * @param page	页面编码
 * @param getData get参数胡
 * @param postData
 * @constructor
 */
$$.GotoManNiuLogistics = function(userId, page, getData, postData) {
    $$.GotoCors($$.URL.MAN_NIU_URL, userId, "LogisticsFpp/logistics", page, getData, postData);
}

/**
 * 跳转至freesj页面
 * @param page
 * @param getData
 * @param postData
 * @constructor
 */
$$.GotoFreeSj = function(userId, pagePrefix, page, getData, postData) {
    $$.GotoCors($$.URL.FREE_SJ_URL, userId, pagePrefix, page, getData, postData);
}

$$.getSearch = function(data) {
	var search = "";
	if(data instanceof String || typeof data == 'string') {
		search = data;
	} else if(data instanceof Object) {
		var param = [];
		for(var key in data) {
			param.push(key + '=' + data[key]);
		}
		search = param.join('&');
	}
	return search;
}

/**
 * 动态引入html文件
 * @param {Object} id DOM节点ID
 * @param {Object} html  html文件
 */
$$.LoadHTML = function(id, html) {
	$(id).load(html);
}