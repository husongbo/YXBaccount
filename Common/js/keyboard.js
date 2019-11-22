// 全局变量
var Global_type, Global_show, Global_safe, Global_count = 0;

(function ($) {
    $.fn.KeyBoard = function (options) {
        // 默认配置
        var defaults = {
            random: true, // 随机键盘
            type: "money", // 密码 password or 金额 money
            show: "", // 展示区域
            safe: false // 加密显示
        }
        options = $.extend(defaults, options);

        return this.each(function () {
            Global_type = defaults.type;
            Global_show = defaults.show;
            Global_safe = defaults.safe;

            var keyboard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

            if (defaults.random) {
                // 生成0-9随机排列组合
                function randomsort(a, b) {
                    return Math.random() > .5 ? -1 : 1;
                }
                var keyboard = keyboard.sort(randomsort);
            }

            $(this).append("<div class=\"row\"><div class=\"col-xs-9 keyboard-numBtn\"></div><div class=\"col-xs-3 keyboard-operation\"></div></div>");
            $(this).find(".keyboard-numBtn").append("<div class=\"row row_1\"></div><div class=\"row row_2\"></div><div class=\"row row_3\"></div><div class=\"row row_4\"></div>");
            $(this).find(".keyboard-operation").append("<div class=\"row row_1\"></div><div class=\"row row_2\">");

            // 生成数字按钮
            for (var i = 0; i < keyboard.length + 2; i++) {
                var btn_list = "<div class=\"col-xs-4\" onclick=\"selectBtn('" + keyboard[i] + "')\">" + keyboard[i] + "</div>";
                // console.log(i)
                if (i <= 2) {
                    $(this).find(".keyboard-numBtn").find(".row_1").append(btn_list);
                } else if (i >= 3 && i <= 5) {
                    $(this).find(".keyboard-numBtn").find(".row_2").append(btn_list);
                } else if (i >= 6 && i <= 8) {
                    $(this).find(".keyboard-numBtn").find(".row_3").append(btn_list);
                } else {
                    if (i == 9) {
                        btn_list = "<div class=\"col-xs-4\" onclick=\"hiddenKeyboard()\"><i class=\"iconfont\">&#xe60e;</i></div>";
                    } else if (i == 11) {
                        if (defaults.type == "password") {
                            btn_list = "<div class=\"col-xs-4\">.</div>";
                        } else {
                            btn_list = "<div class=\"col-xs-4\" onclick=\"selectBtn(\'.\')\">.</div>";
                        }
                    } else if (i == 10) {
                        btn_list = "<div class=\"col-xs-4\" onclick=\"selectBtn('" + keyboard[9] + "')\">" + keyboard[9] + "</div>";
                    }
                    $(this).find(".keyboard-numBtn").find(".row_4").append(btn_list);
                }


            }

            // 生成删除和确定按钮
            $(this).find(".keyboard-operation").find(".row_1").append("<div class=\"col-xs-12 keyboard-operation-delete\" onclick=\"deleteBtn()\"><i class=\"iconfont\">&#xe620;</i></div>");
            if (defaults.type == "password") {
                $(this).find(".keyboard-operation").find(".row_2").append("<div class=\"col-xs-12 keyboard-operation-submit\" onclick=\"submitBtn()\">确定</div>");
            } else {
                $(this).find(".keyboard-operation").find(".row_2").append("<div class=\"col-xs-12 keyboard-operation-submit\" onclick=\"submitBtn()\">支付</div>");
            }

            // 生成展示框
            if (defaults.type == "money") {
                defaults.show.html('<input type="text" class="keyboard-input-text input_ keyboard-password" disabled>');
            } else {
                defaults.show.append('<input type="text" class="keyboard-input-text input_ keyboard-password hidden" disabled>');
                for (var j = 1; j <= 6; j++) {
                    var str = '<input type="text" class="keyboard-input-text input_' + j + ' keyboard-money" disabled>'
                    defaults.show.append(str);
                }
            }
            
            // 显示键盘
            Global_show.on("click", function () {
                $('.keyboard-box').removeClass('animated fadeOutDownBig');
                $('.keyboard-box').addClass('animated fadeInUpBig');
            })
        });
    };
})(jQuery);

// 输入
function selectBtn(text) {
    var _input = Global_show.find(".input_")
    var _value = _input.val();
    if (Global_type == "money") {
        // 点只能输入一次
        if (text == '.') {
            if (_value.indexOf(".") >= 1) {
                return false;
            }
        }
        // 第一位如果是0的话
        if (_value == '0' && text != '.') {
            _value = '';
        }
        // 第一位如果是.的话
        if (!_value && text == '.') {
            _value = '0';
        }
        _value += text;
        _input.val(_value);
    } else {
        // 密码不超过6位
        if (Global_count < 6) {
            Global_count = Global_count + 1;
            _value += text;
            _input.val(_value);
            if (Global_safe) {
                Global_show.find(".input_" + Global_count).val("·");
            } else {
                Global_show.find(".input_" + Global_count).val(_value.slice(Global_count - 1, Global_count));
            }
        }
    }
};

// 删除
function deleteBtn() {
    var val = "";
    var len = (Global_show.find(".input_").val()).length;
    if (len > 1) {
        val = (Global_show.find(".input_").val()).substring(0, len - 1);
    }
    Global_show.find(".input_").val(val);
    if (Global_type == "password" && Global_count > 0) {
        Global_show.find(".input_" + Global_count).val("");
        Global_count = Global_count - 1;
        console.log(Global_count)
    }
};

// 隐藏键盘
function hiddenKeyboard() {
    if ($('.keyboard-box').hasClass('animated fadeOutDownBig')) {
        $('.keyboard-box').removeClass('animated fadeOutDownBig');
        $('.keyboard-box').addClass('animated fadeInUpBig');
    } else {
        $('.keyboard-box').removeClass('animated fadeInUpBig');
        $('.keyboard-box').addClass('animated fadeOutDownBig');
    }
};

// 支付或确认
function submitBtn() {
    console.log(Global_show.find(".input_").val());
};