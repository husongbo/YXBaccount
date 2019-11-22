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
		var table = [{"REMAINING_SUM":100}];
		return table;
	}
	
	/**
	 * 添加交易记录
	 *
	 * @param {Object}
	 * 			record.T0102_ORDER_ID {String} 订单ID
	 * 			record.T0102_YMD {String} 交易日期，8位 如：20150621 
	 * 			record.T0102_TYPE 交易类型  
				record.T0102_AMOUNT = 100 交易金额
	 * @param {int}
	 * 			record.tableId 账号表ID，默认不填，多账号时使用
	 */	
	this.AddTradingRecord = function(record) {
	}
	
	/**
	 * 订单查询
	 * 
	 * @param {int}
	 * 			tableId 账号表ID，默认不填，多账号时使用
	 */
	this.QueryBill = function (tableId) {
		var table = [{"BILL_ID":1,"USER_ID":1000017,"CLOSE_YMD":"","BILL_YM":"2017/09","START_DAY":"2017/09/01","END_DAY":"2017/09/30","OPENING_BALANCE":0,"CLOSING_BALANCE":20000,"DEAL_AMOUNT":20000,"CREDIT_AMOUNT":0}];
		return table;
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
		var table = [{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":8,"ORDER_ID":"ORDERID39205","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"消费测试","AMOUNT":-25.35,"DATA_CREATE":"2017/09/18 11:27:34","DATA_UPDATE":"AAAAAAAACEo="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":7,"ORDER_ID":"ORDERID327077","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"充值测试","AMOUNT":100,"DATA_CREATE":"2017/09/18 11:27:33","DATA_UPDATE":"AAAAAAAACEc="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":6,"ORDER_ID":"ORDERID12717","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"消费测试","AMOUNT":-99.63,"DATA_CREATE":"2017/09/18 11:27:32","DATA_UPDATE":"AAAAAAAACEQ="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":5,"ORDER_ID":"ORDERID668762","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"消费测试","AMOUNT":-64.31,"DATA_CREATE":"2017/09/18 11:27:31","DATA_UPDATE":"AAAAAAAACEE="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":4,"ORDER_ID":"ORDERID131545","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"消费测试","AMOUNT":-86.41,"DATA_CREATE":"2017/09/18 11:27:31","DATA_UPDATE":"AAAAAAAACD4="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":3,"ORDER_ID":"ORDERID88597","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"充值测试","AMOUNT":100,"DATA_CREATE":"2017/09/18 11:27:30","DATA_UPDATE":"AAAAAAAACDs="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":2,"ORDER_ID":"ORDERID723341","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"充值测试","AMOUNT":100,"DATA_CREATE":"2017/09/18 11:27:29","DATA_UPDATE":"AAAAAAAACDg="},{"BILL_ID":1,"USER_ID":1000017,"BILL_YM":"2017/09","TRADING_ID":1,"ORDER_ID":"ORDERID596351","BOOKED_YMD":"2017/09/18","YMD":"2017/08/15","TYPE":"充值测试","AMOUNT":100,"DATA_CREATE":"2017/09/18 11:27:28","DATA_UPDATE":"AAAAAAAACDU="}];
		return table;
	}

	this.GetUserCardInfo = function () {
	}
}



