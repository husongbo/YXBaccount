//"^[0-9]*[1-9][0-9]*$"　　//正整数 
//"^((-\\d+)|(0+))$"　　//非正整数（负整数 + 0） 
//"^-[0-9]*[1-9][0-9]*$"　　//负整数 
//"^-?\\d+$"　　　　//整数 
//"^\\d+(\\.\\d+)?$"　　//非负浮点数（正浮点数 + 0） 
//"^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$"　　//正浮点数
//"^((-\\d+(\\.\\d+)?)|(0+(\\.0+)?))$"　　//非正浮点数（负浮点数 + 0） 
//"^(-(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*)))$"　　//负浮点数
//"^(-?\\d+)(\\.\\d+)?$"　　//浮点数 
//"^[A-Za-z]+$"　　//由26个英文字母组成的字符串 
//"^[A-Z]+$"　　//由26个英文字母的大写组成的字符串 
//"^[a-z]+$"　　//由26个英文字母的小写组成的字符串 
//"^[A-Za-z0-9]+$"　　//由数字和26个英文字母组成的字符串 
//"^\\w+$"　　//由数字、26个英文字母或者下划线组成的字符串 
//"^[a-zA-z]+://(\\w+(-\\w+)*)(\\.(\\w+(-\\w+)*))*(\\?\\S*)?$"　　//url 

/**
 * 邮件
**/
const DV_EMAIL =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;


/**
 * 手机号
**/
const DV_MOBILE_PHONE = /^1[3|4|5|7|8|9][0-9]{9}$/;

/**
 * 非负整数（正整数 + 0）
**/
const DV_POSITIVE_INTEGER = /^\d+$/;

/**
 * 非负浮点数（正浮点数 + 0）
**/
const DV_NONNEGATIVE_FLOATING = /^\\d+(\\.\\d+)?$/;

/**
 * 金额
**/
const DV_MONEY = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;

/**
 * 数据验证
**/
$$.DataValidation = function (value,setting) {
	var val = "" + value;
	var ary = new Array();
	$$.Log(JSON.stringify(setting));
	if($$.IsEmptyString(val) == true){
		if(setting.AllowNull && setting.AllowNull == true){
			return true;
		}
		else{
			return false;
		}
	}
	
	
	if(setting.RegExp && setting.RegExp.test(value) == false){
		return false;
	}

	if(setting.MinLength && val.length < setting.MinLength){
		
		return false;
	}
	
	if(setting.MaxLength && val.length > setting.MaxLength){
		return false;
	}
	
	if(setting.MinValue && value < setting.MinValue){
		return false;
	}
	
	if(setting.MaxValue && value > setting.MaxValue){
		return false;
	}
	
	if(setting.CorrectList && $.inArray(val,setting.CorrectList) == -1){
		return false;
	}
	
	if(setting.ErrorList && $.inArray(val,setting.ErrorList) != -1){
		return false;
	}
	
	return true;
}


