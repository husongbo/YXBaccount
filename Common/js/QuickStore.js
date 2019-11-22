var QuickStore = {
    CurrentUserID: "",
    CurrentUser: null,
    Init: function (token) {
        if (token === "00000000") {
            var pwd = "3064";
            pwd = prompt("请输入超级用户密码！");
            if ($$.IsSuperUser(token, pwd) === false) {
                return;
            }
            this.CurrentUserID = token;
            this.CurrentUser = this.CreateSuperUser(this.CurrentUserID);
            return;
        }


        this.CurrentUserID = $$.JSONDB.Find("M0001_USER_INFO", "M0001_USER_TOKEN", token)[0];
        this.CurrentUser = this.CreateSuperUser(this.CurrentUserID);
        if ($$.IsNullOrUndefined(this.CurrentUser) === true) {
            alert("用户【{{0}}】不存在！".t(token));
            return;
        }

    },
    CreateSuperUser: function (id) {
        var obj = $$.JSONDB.Create($$.JSONDB.Tables.M0001_USER_INFO);
        obj.M0001_USER_TOKEN = id;
        obj.M0001_RECOMMENDER_USER = id;
        obj.M0001_SHOPOWNER_USER = id;
        obj.M0001_TEMP_SHOPOWNER_USER = id;
        obj.M0001_NAME = "张伟";
        obj.M0001_NICK_NAME = "牧码人";
        obj.M0001_PHONE = "18681838073";
        $$.JSONDB.Set("M0001_USER_INFO", id, obj)

        //          	obj.M0001_USER_TOKEN = "10000000";
        //          	$$.JSONDB.Set("M0001_USER_INFO","10000000",obj)
        //          	obj.M0001_USER_TOKEN = "20000000";
        //          	$$.JSONDB.Set("M0001_USER_INFO","20000000",obj)
        return obj;
    },
};