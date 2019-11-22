$(function() {

	// 选择商品
	$("#myGoods").click(function() {
		$.router.load("#selGoods");
	});

	$("#otherGoods").click(function() {
		layer.open({
			content: '目前不支持',
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
	});

	$("input[type='radio']").click(function() {
		$.router.load("#publish");
		$("#showGoods").show();
	});

	// 公有活动 私有活动
	$(".switch").click(function() {
		if(this.src.search("off.png") != -1) {
			this.src = "../Common/image/on.png";
			$(this).prev().text("公有活动");
		} else {
			this.src = "../Common/image/off.png";
			$(this).prev().text("私有活动");
		}

	})

	/**	
	 * 创建活动
	 */
	var fbhd = {
		imgSrc: [],
		getNowDate: function() {
			var nowDate = new Date();
			var myYear = nowDate.getFullYear();
			var myMonth = nowDate.getMonth() + 1;
			var nowDate = nowDate.getDate();
			myMonth = myMonth < 10 ? "0" + myMonth : myMonth;
			nowDate = nowDate < 10 ? "0" + nowDate : nowDate;
			return myYear + "-" + myMonth + "-" + nowDate;
		}
	}

	// 上传图片
	

	// 日期选择器
	var showDate = fbhd.getNowDate();
	$("#startTime,#endTime").calendar({
		value: [showDate],
		minDate: showDate
	});

	// 确认发布
	$("#fabu").click(function() {
		// 活动基本信息
		var name = $("#name").val();
		var startT = $("#startTime").val();
		var endT = $("#endTime").val();
		var des = $("#des").val();
		var imgs = $(".img-box").length;
		var goodsId = $("input[type='radio']").attr("data-id");
		if(!name) {
			layer.open({
				content: '请输入活动名称',
				skin: 'msg',
				time: 2
			});
			return
		}

		if(!startT) {
			layer.open({
				content: '请选择开始时间',
				skin: 'msg',
				time: 2
			});
			return
		}
		startT = startT.replace(/-/g, "");

		if(!endT) {
			layer.open({
				content: '请选择结束时间',
				skin: 'msg',
				time: 2
			});
			return
		}
		endT = endT.replace(/-/g, "");

		if(!des) {
			layer.open({
				content: '请输入活动描述',
				skin: 'msg',
				time: 2
			});
			return
		}

		if(imgs.length == "0") {
			layer.open({
				content: '请选择活动图片',
				skin: 'msg',
				time: 2
			});
			return
		}

		// 选择的商品
		var data = {
			"商户标识": "1",
			"商品标识": goodsId,
			"活动名": name,
			"有效期开始": startT,
			"有效期结束": endT,
			"有效类别": "0",
			"活动类别": "1",
			"活动图片": fbhd.imgSrc.join(),
			"活动概述": des,
			"操作用户": "0"
		}
		var tmpl = "{{商户标识}},{{商品标识}},'{{活动名}}',{{有效期开始}},{{有效期结束}},{{有效类别}},{{活动类别}},'{{活动图片}}','{{活动概述}}','{{操作用户}}'";
		var params = tmpl.t(data);
		var proc = "活动创建 " + params;
		var rst = $$.JSONDB.Query(proc);
		layer.open({
			content: rst.Table[0].MESSAGE,
			skin: 'msg',
			time: 2
		});
		console.log(rst)
		location.href = "active.html";
	});
});