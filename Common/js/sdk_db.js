$$.JSONDB = {
    Config: {
        PathSplitChar: "/",
        FieeExtension: ".json",
        Debug: true,
    },
    Query: function (sql) {
        var rst = $$.FileSystem.CallCommand("Query", sql);
        return rst;
    },
    Exec: function (sql) {
        return $$.FileSystem.CallCommand("Exec", sql);
    },
    Check : function(obj,field){
    	if($$.IsNullOrUndefined(obj[field.CD]) == true){
    		return false;
    	}
    	
    	return $$.DataValidation(obj[field.CD],field.DataValidation);
    },
    Uql: function (info) {
        return $$.FileSystem.CallCommand("Uql", info);
    },
    List : function(pTable, pIDList,pFunc){
    	
    	var cmd = null;
		var aryCommand = new Array();
		var _this = this;

    	$.each(pIDList,function(key){
    		var id = pIDList[key];
    		if ($$.IsEmptyString(id) == true) {
	            var obj = TableDefine[pTable];
	            obj = this.Create(obj);
	            return obj;
	        }
			
	        var path = _this.GetDataFilePath(pTable, id);
	        cmd = $$.FileSystem.CreateCommand("GetFileContent", path, "");
	        aryCommand.push(cmd);
    	});

    	var ary = $$.FileSystem.Commbit(aryCommand);    	
    	$.each(ary, function(idx) {
    		ary[idx] = JSON.parse(ary[idx]);
    	});
    	return ary;
    },
    Get: function (pTable, pID) {
        
        if ($$.IsEmptyString(pID) == true) {
            var obj = TableDefine[pTable];
            obj = this.Create(obj);
            return obj;
        }
		
        var path = this.GetDataFilePath(pTable, pID);
        var rst = $$.FileSystem.GetFileContent(path, "");
        
        if (rst != "") {
            var jsonObj = JSON.parse(rst);
            $.each(jsonObj, function(key) {
				if($$.IsNullOrUndefined(TableDefine[pTable][key]) == true){
					delete jsonObj[key];
					//alert(pTable + ":" +key);
				}
			});
			return jsonObj;
        }
        return null;
    },
    Set: function (pTable, pID, pValue) {
		var path = "";
		var cmd = null;
		var aryCommand = new Array();
		
		var old = null;
        if ($$.IsEmptyString(pID) == false) {
            old = this.Get(pTable, pID);
        }
        
		$.each(old,function(key){
			if($$.IsNullOrUndefined(pValue[key]) == true){
				pValue[key] = old[key];
			}
		});
		
		$.each(pValue, function(key) {
			if($$.IsNullOrUndefined(TableDefine[pTable][key]) == true){
				delete pValue[key];
			}
		});
		
		path = this.GetDataFilePath(pTable, pID);
        cmd = $$.FileSystem.CreateCommand("SetFileContent", path, pValue);
        
        aryCommand.push(cmd);
        var id = $$.FileSystem.Commbit(aryCommand).pop();

        //获取需要更新的索引列表
        var aryIndex = this.GetTableIndexArray(pTable, pValue);
        
        path = "";
        cmd = null;
        aryCommand = new Array();
        
        if (aryIndex.length >= 0) {
            for (var i = 0; i < aryIndex.length; i++) {
                var fld = aryIndex[i];
                
                if (old != null && old[fld] != pValue[fld]) {
                    path = this.GetDataIndexFilePath(pTable, fld, old[fld], id);
                    cmd = $$.FileSystem.CreateCommand("RemoveFile", path);
                    aryCommand.push(cmd);
                }

                path = this.GetDataIndexFilePath(pTable, fld, pValue[fld], id);
                cmd = $$.FileSystem.CreateCommand("SetFileContent", path, { "dataindex": "zhw" });
                aryCommand.push(cmd);
            }
            
            $$.FileSystem.Commbit(aryCommand);
            
        }
        return id;
    },
    Remove: function (pTable, pID) {
        
        var obj = this.Get(pTable, pID);
        
        if (obj == null) {

            return null;
        }
        
        //获取需要更新的索引列表
        var aryIndex = this.GetTableIndexArray(pTable, obj);

        var path = "";
        var cmd = null;
        var aryCommand = new Array();
        for (var i = 0; i < aryIndex.length; i++) {
            var fld = aryIndex[i];
            path = this.GetDataIndexFilePath(pTable, fld, obj[fld], pID);
            cmd = $$.FileSystem.CreateCommand("RemoveFile", path);
            aryCommand.push(cmd);
        }
		
        path = this.GetDataFilePath(pTable, pID);
        cmd = $$.FileSystem.CreateCommand("RemoveFile", path);
        aryCommand.push(cmd);
        return $$.FileSystem.Commbit(aryCommand);
    },
    GetDataFolderPath: function (pTable) {
        return pTable.replace(/\./g, this.Config.PathSplitChar);
    },
    GetDataFilePath: function (pTable, pID) {
        var path = this.GetDataFolderPath(pTable);
        return path + this.Config.PathSplitChar + pID + this.Config.FieeExtension;
    },
    GetDataIndexFolderPath: function (pTable, pField, pValue) {
        return this.GetDataFolderPath("DataIndex." + pTable + "." + pField + "." + pValue);
    },
    GetDataIndexFilePath: function (pTable, pField, pValue, pID) {
        var path = this.GetDataIndexFolderPath(pTable, pField, pValue);
        return path + this.Config.PathSplitChar + pID + this.Config.FieeExtension;
    },
    Create: function (pTableObject, pHasDefaultValue) {
        if (pHasDefaultValue == undefined) {
            pHasDefaultValue = true;
        }
        var obj = {};
        $.each(pTableObject, function (fld) {
            if (pHasDefaultValue == true) {
                obj[fld] = pTableObject[fld].DefaultValue;
            } else {
                obj[fld] = null;
            }
        });
        return obj;
    },
    DataValidation : function(obj,table){
    	$.each(obj, function(key) {
    		
    	});
    },
    GenerateCode : function(table){
    	
    	$$.GotoURL("../Component/Code.html",{'table':table});
    	
    },
    GetTableIndexArray: function (pTable, pTableObject) {
        var aryIndex = new Array();
        //获取需要更新的索引列表
        $.each(pTableObject, function (fld) {
            if ($$.JSONDB.FieldIsIndex(pTable, fld) == true) {
                aryIndex.push(fld);
            }
        });
        return aryIndex;
    },
    FieldIsIndex: function (pTable, pField) {
    	$$.Log(pField);
    	var idName = pTable.split("_")[0] + "_ID";
    	if(idName == pField){
    		return false;
    	}
        return TableDefine[pTable][pField].IsIndex;
    },
    Find: function (pTable, pIndex, pValue,pFunc) {
    	var params = new Array();
    	if($$.IsNullOrUndefined(pTable) == false){
    		params.push(pTable);
    		if($$.IsNullOrUndefined(pIndex) == false){
    			params.push(pIndex);
    			if($$.IsNullOrUndefined(pValue) == false){
    				params.push(pValue);
    			}
    		}
    	}
        var path = "";
        var cmd = null;
        if (params.length == 1) {
            path = this.GetDataFolderPath(pTable);
            if($$.IsNullOrUndefined(pFunc) == false){
            	$$.FileSystem.CallCommand("GetFiles",path,null,pFunc);	
            }
            else{
            	return $$.FileSystem.CallCommand("GetFiles",path,null,function(rst){ pFunc(rst[0]);})[0];
            }
            
        }
        else if (params.length == 2) {
            path = this.GetDataIndexFolderPath(pTable, pIndex);
            if($$.IsNullOrUndefined(pFunc) == false){
            	$$.FileSystem.CallCommand("GetDirectories",path,null,function(rst){ pFunc(rst[0]);});
            }
            else{
            	return $$.FileSystem.CallCommand("GetDirectories",path,null,pFunc)[0];
            }
        }
        else if (params.length == 3) {
            path = this.GetDataIndexFolderPath(pTable, pIndex, pValue);
            if($$.IsNullOrUndefined(pFunc) == false){
            	$$.FileSystem.CallCommand("GetFiles",path,null,function(rst){ pFunc(rst[0]);});
            }
            else{
            	return $$.FileSystem.CallCommand("GetFiles",path,null,pFunc)[0];
            }
        }

        return TableDefine;
    },
    Test: function () {
        for (var i = 0; i < 1; i++) {
            var obj = this.Get("M0001_USER_INFO");

            obj.M0001_RECOMMENDER_USER = i % 2;
            obj.M0001_SHOPOWNER_USER = i % 3;
            this.Set("M0001_USER_INFO", "", obj);
        }
    },
};


var TableDefine = {
	/**
	 *用户信息表 
	 **/
	M0001_USER_INFO: {
		/**
		 *用户令牌 
		 **/
		M0001_USER_TOKEN: {
			CD: "M0001_USER_TOKEN",
			Name: "用户令牌",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 *推荐人 
		 **/
		M0001_RECOMMENDER_USER: {
			CD: "M0001_RECOMMENDER_USER",
			Name: "推荐人",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 *终身店长 
		 **/
		M0001_SHOPOWNER_USER: {
			CD: "M0001_SHOPOWNER_USER",
			Name: "终身店长",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 *临时店长 
		 **/
		M0001_TEMP_SHOPOWNER_USER: {
			CD: "M0001_TEMP_SHOPOWNER_USER",
			Name: "临时店长",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 *用户姓名 
		 **/
		M0001_NAME: {
			CD: "M0001_NAME",
			Name: "用户姓名",
			DefaultValue: "",
			IsIndex: false,
		},
		/**
		 *用户昵称 
		 **/
		M0001_NICK_NAME: {
			CD: "M0001_NICK_NAME",
			Name: "用户昵称",
			DefaultValue: "",
			IsIndex: false,
		},
		/**
		 *联系电话 
		 **/
		M0001_PHONE: {
			CD: "M0001_PHONE",
			Name: "联系电话",
			DefaultValue: "",
			IsIndex: false,
		},
		/**
		 *常用邮箱 
		 **/
		M0001_EMAIL: {
			CD: "M0001_EMAIL",
			Name: "常用邮箱",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *身份证(正)
		 **/
		M0001_CARD_PHOTO_A: {
			CD: "M0001_CARD_PHOTO_A",
			Name: "身份证(正)",
			DefaultValue: "",
			IsIndex: false,
		},
		/**
		 *身份证(反)
		 **/
		M0001_CARD_PHOTO_B: {
			CD: "M0001_CARD_PHOTO_B",
			Name: "身份证(反)",
			DefaultValue: "",
			IsIndex: false,
		},
		/**
		 *驾驶证
		 **/
		M0001_DRIVER_PHOTO: {
			CD: "M0001_DRIVER_PHOTO",
			Name: "驾驶证",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *国家
		 **/
		M0001_SUPPLIER_COUNTRY: {
			CD: "M0001_SUPPLIER_COUNTRY",
			Name: "国家",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			}
		},
		/**
		 *省
		 **/
		M0001_SUPPLIER_PROVINCE: {
			CD: "M0001_SUPPLIER_PROVINCE",
			Name: "省",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *市
		 **/
		M0001_SUPPLIER_CITY: {
			CD: "M0001_SUPPLIER_CITY",
			Name: "市",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *区/县 
		 **/
		M0001_SUPPLIER_CONUNTY: {
			CD: "M0001_SUPPLIER_CONUNTY",
			Name: "区/县 ",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *详细地址 
		 **/
		M0001_SUPPLIER_ADDRESS: {
			CD: "M0001_SUPPLIER_ADDRESS",
			Name: "详细地址县 ",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
	/**
	 *商品信息表 
	 **/
	M0101_COMMODITY_INFO: {
		/**
		 *用户ID 
		 **/
		M0001_ID: {
			CD: "M0001_ID",
			Name: "用户ID",
			DefaultValue: "",
			IsIndex: true,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *商品名称 
		 **/
		M0101_COMMODITY_NAME: {
			CD: "M0101_COMMODITY_NAME",
			Name: "商品名称",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *商品简介 
		 **/
		M0101_COMMODITY_NOTE: {
			CD: "M0101_COMMODITY_NOTE",
			Name: "商品简介",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 50,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *商品关键字 
		 **/
		M0101_COMMODITY_KEYWORD: {
			CD: "M0101_COMMODITY_KEYWORD",
			Name: "商品关键字",
			DefaultValue: "其它商品",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: null,
				MaxLength: 200,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *销售单位 
		 **/
		M0101_SALES_UNIT: {
			CD: "M0101_SALES_UNIT",
			Name: "销售单位",
			DefaultValue: "件",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 5,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *销售价格 
		 **/
		M0101_SELLING_PRICE: {
			CD: "M0101_SELLING_PRICE",
			Name: "销售价格",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: DV_MONEY,
				MinLength: null,
				MaxLength: null,
				MinValue: 0,
				MaxValue: 99999,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货价格 
		 **/
		M0101_SUPPLIER_PRICE: {
			CD: "M0101_SUPPLIER_PRICE",
			Name: "发货价格",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: DV_MONEY,
				MinLength: null,
				MaxLength: null,
				MinValue: 0,
				MaxValue: 99999,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *允许代销 
		 **/
		M0101_SALES_AGENT: {
			CD: "M0101_SALES_AGENT",
			Name: "允许代销",
			DefaultValue: "0",
			IsIndex: true,
			DataValidation: {
				AllowNull: false,
				RegExp: DV_POSITIVE_INTEGER,
				MinLength: null,
				MaxLength: null,
				MinValue: 0,
				MaxValue: 1,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人姓名 
		 **/
		M0101_SUPPLIER_NAME: {
			CD: "M0101_SUPPLIER_NAME",
			Name: "发货人姓名",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 10,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人电话 
		 **/
		M0101_SUPPLIER_PHONE: {
			CD: "M0101_SUPPLIER_PHONE",
			Name: "发货人电话",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: DV_MOBILE_PHONE,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人国家 
		 **/
		M0101_SUPPLIER_COUNTRY: {
			CD: "M0101_SUPPLIER_COUNTRY",
			Name: "发货人国家",
			DefaultValue: "中国",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 30,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人省 
		 **/
		M0101_SUPPLIER_PROVINCE: {
			CD: "M0101_SUPPLIER_PROVINCE",
			Name: "发货人省",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人市 
		 **/
		M0101_SUPPLIER_CITY: {
			CD: "M0101_SUPPLIER_CITY",
			Name: "发货人市",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: true,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人区/县 
		 **/
		M0101_SUPPLIER_CONUNTY: {
			CD: "M0101_SUPPLIER_CONUNTY",
			Name: "发货人区/县",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: true,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 *发货人详细地址 
		 **/
		M0101_SUPPLIER_ADDRESS: {
			CD: "M0101_SUPPLIER_ADDRESS",
			Name: "发货人详细地址",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
	/**
	 *商品详情表 
	 **/
	M0102_COMMODITY_DETAIL: {
		/**
		 *商品ID 
		 **/
		M0101_ID: {
			CD: "M0101_ID",
			Name: "商品ID",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 *商品细节类型 
		 **/
		M0102_DETAIL_TYPE: {
			CD: "M0201_DETAIL_TYPE",
			Name: "商品细节类型",
			DefaultValue: "",
			IsIndex: false,
		},
		/**
		 *商品细节数据 
		 **/
		M0102_DETAIL_DATA: {
			CD: "M0201_DETAIL_DATA",
			Name: "商品细节数据",
			DefaultValue: "",
			IsIndex: false,
		},
	},
	/**
	 * 用户卡片信息
	 **/
	M0002_USER_CARD: {
		/**
		 * 卡片信息
		 **/
		M0002_ID: {
			CD: "M0002_ID",
			Name: "卡片信息标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 用户标识
		 **/
		M0001_ID: {
			CD: "M0001_ID",
			Name: "用户标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 卡片类型
		 **/
		M0002_TYPE: {
			CD: "M0002_TYPE",
			Name: "卡片类型",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 卡片编号
		 **/
		M0002_CARD_CD: {
			CD: "M0002_APPEOVAL_YMD",
			Name: "卡片编号",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 批准日期
		 **/
		M0002_APPEOVAL_YMD: {
			CD: "M0002_APPEOVAL_YMD",
			Name: "批准日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
	/**
	 * 账单管理表
	 **/
	T0101_BILL: {
		/**
		 * 账单标识
		 **/
		T0101_ID: {
			CD: "T0101_ID",
			Name: "账单标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 用户标识
		 **/
		M0001_ID: {
			CD: "M0001_ID",
			Name: "用户标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 结账日期
		 **/
		T0101_CLOSE_YMD: {
			CD: "T0101_CLOSE_YMD",
			Name: "结账日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 结账周期
		 **/
		T0101_YM: {
			CD: "T0101_YM",
			Name: "结账周期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 期初余额
		 **/
		T0101_OPENING_BALANCE: {
			CD: "T0101_OPENING_BALANCE",
			Name: "初期余额",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易总额
		 **/
		T0101_DEAL_AMOUNT: {
			CD: "T0101_DEAL_AMOUNT",
			Name: "交易总额",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 信用额度
		 **/
		T0101_CREDIT_AMOUNT: {
			CD: "T0101_CREDIT_AMOUNT",
			Name: "信用额度",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
	/**
	 * 交易记录表
	 **/
	T0102_TRADING_RECORD: {
		/**
		 * 交易标识
		 **/
		T0102_ID: {
			CD: "T0102_ID",
			Name: "交易标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 账单标识
		 **/
		T0101_ID: {
			CD: "T0101_ID",
			Name: "账单标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 入账日期
		 **/
		T0102_BOOKED_YMD: {
			CD: "T0102_BOOKED_YMD",
			Name: "入账日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易日期
		 **/
		T0102_YMD: {
			CD: "T0102_YMD",
			Name: "交易日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易类型
		 **/
		T0102_TYPE: {
			CD: "T0102_TYPE",
			Name: "交易类型",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易金额
		 **/
		T0102_AMOUNT: {
			CD: "T0102_AMOUNT",
			Name: "交易金额",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
	/**
	 * 交易历史记录表
	 **/
	T0103_HISTORY_TRADING_RECORD: {
		/**
		 * 交易标识
		 **/
		T0103_ID: {
			CD: "T0103_ID",
			Name: "交易标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 账单标识
		 **/
		T0101_ID: {
			CD: "T0101_ID",
			Name: "账单标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 结账日期
		 **/
		T0103_BOOKED_YMD: 　{
			CD: "T0103_BOOKED_YMD",
			Name: "结账日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易日期
		 **/
		T0103_YMD: {
			CD: "T0103_YMD",
			Name: "交易日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易类型
		 **/
		T0103_TYPE: {
			CD: "T0103_TYPE",
			Name: "交易类型",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 交易金额
		 **/
		T0103_AMOUNT: {
			CD: "T0103_AMOUNT",
			Name: "交易金额",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
	/**
	 * 用户信息用额度管理
	 **/
	T0201_CREDIT_APPLE: {
		/**
		 * 信用额度标识
		 **/
		M0002_ID: {
			CD: "M0002_ID",
			Name: "信用额度标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 用户标识
		 **/
		T0201_ID: {
			CD: "T0201_ID",
			Name: "用户标识",
			DefaultValue: "",
			IsIndex: true,
		},
		/**
		 * 申请额度
		 **/
		T0201_APPLE_AMOUNT: {
			CD: "T0201_APPLE_AMOUNT",
			Name: "申请额度",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 申请日期
		 **/
		T0201_APPLE_YMD: {
			CD: "T0201_APPLE_YMD",
			Name: "申请日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 批准额度
		 **/
		T0201_RATIFY_AMOUNT: {
			CD: "T0201_RATIFY_AMOUNT",
			Name: "批准额度",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
		/**
		 * 批准日期
		 **/
		T0201_RATIFY_YMD: {
			CD: "T0201_RATIFY_YMD",
			Name: "批准日期",
			DefaultValue: "",
			IsIndex: false,
			DataValidation: {
				AllowNull: false,
				RegExp: null,
				MinLength: 1,
				MaxLength: 15,
				MinValue: null,
				MaxValue: null,
				CorrectList: null,
				ErrorList: null,
			},
		},
	},
};