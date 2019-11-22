var Bill = new function() {
	$$.FileSystem.Config.ProcessURL = "../Common/CSharp/FileSystemAccess.ashx";
	
	this.userId = "{{CurrentUserID}}";
	/**
	 * 余额查询
	 * 
	 * @param {int}
	 * 			tableId 账号表ID，默认不填，多账号时使用
	 */
	this.GetAccountBalance = function(tableId) {
		var params = this.userId + ', 0';
		if (!tableId) {
			tableId = 0;
		}
		params += ',' + tableId + ',' + 1;
		var proc = "GetAccountBalance " + params;
		var rst = $$.JSONDB.Query(proc);
		$$.Log(rst);
		return rst.Table;
	}
	
	/**
	 * 订单查询
	 * 
	 * @param {int}
	 * 			tableId 账号表ID，默认不填，多账号时使用
	 */
	this.QueryBill = function (tableId) {
		var params = this.userId;
		if (tableId) {
			params += ',' + tableId;
		}
		var proc = "QueryBill " + params;
		var rst = $$.JSONDB.Query(proc);	
		$$.Log(rst);
		return rst.Table;
	}
	
	/**
	 * 已出订单查询
	 * 
	 * @param {int}
	 * 			tableId 账号表ID，默认不填，多账号时使用
	 */
	this.QueryClosedBill = function (tableId) {
		var rst = this.QueryBill(tableId);
		var data = [];
		$.each(rst, function(index, item) {
			if (item.CLOSE_YMD != "") {
				data.push(item);
			}
		});	
		$$.Log(data);
		return data;
	}
	
	/**
	 * 未出订单查询
	 * 
	 * @param {int}
	 * 			tableId 账号表ID，默认不填，多账号时使用
	 */
	this.QueryUnclosedBill = function (tableId) {
		var rst = this.QueryBill(tableId);
		var data = [];
		$.each(rst, function(index, item) {
			if (item.CLOSE_YMD == "") {
				data.push(item);
			}
		});	
		$$.Log(data);
		return data;
	}
	
	/**
	 * 交易记录查询
	 * 
	 * @param {String}
	 * 			yearMonth 查询月份，6位 如：201506；为空时查询所有
	 */
	this.EnquiryHistoricalTransaction = function(yearMonth, tableId) {
		var params = this.userId;
		if (yearMonth) {
			params += ", '" + yearMonth + "'";
		}
		if (tableId) {
			params += ", "+ tableId;
		}
		var proc = "GetTradingRecord " + params;
		console.log(proc);
		var rst = $$.JSONDB.Query(proc);	
		$$.Log(rst);
		return rst.Table;
	}

	/**
	 * 获取用户油卡信息
	 */
	this.GetUserCardInfo = function () {
		var sql = "SELECT * FROM V0002_USER_CARD WHERE USER_ID=" + this.userId;
		var rst = $$.JSONDB.Query(sql);
		return rst;
	}
}



