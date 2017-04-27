$(function () {
    var _x, _y,_width,_height;
    //绑定基本信息
    $.ajax({
        url: "/user.do",
        data: {
            subtime: "1",
            method: "getUserInfo"
        },
        async: false,
        dataType: "json",
        success: function (data) {
            if (data.status == 200) {
                $(".headicon").attr("src", getUserLogo(data.result.headicon));
                $(".username").text(data.result.username);
                $(".realname").text(data.result.realname);

                $(".personaldata").text(data.result.profile);
                $(".educationdata").text(data.result.eduinfo);
                $(".careerdata").text(data.result.workinfo);
            } else if (data.status == 500 && data.desc == "515002") {//登陆已过期
                tip("登录已过期", 2000, $("#error"));
            } else if (data.status == 500 && data.desc == "515001") {//未登录
                tip("未登录", 2000, $("#error"));
            }
            $("#loadingToast").hide();
        }
    });
    $.ajax({
        url: "/account.do",
        data: {
            subtime: "1",
            method: "getAccounts"
        },
        async: false,
        dataType: "json",
        success: function (data) {
            if (data.status == 200) {
                $(".telphone").text(data.result.phone);
                if (checkundefined(data.result.email) == "") {
                    $(".email").text("未绑定");
                } else if (data.result.authemail != "1") {
                    $(".email").html(data.result.email+"<span class='badge_day'>待验证</span>");
                } else {
                    $(".email").text(data.result.email);
                }
                if(checkundefined(data.result.weixinname)==""){
                    $(".wchat").text("未绑定");
                }else{
                    $(".wchat").text(data.result.weixinname);
                }
                localStorage.setItem("infoAuthphone",checkundefined(data.result.authphone));
                localStorage.setItem("wchaticon",data.result.headicon);
            } else {
                tip("获取信息失败", 2000, $("#error"));
            }
            $("#loadingToast").hide();
        }
    });

    //头像图片点击事件
    $(".headicon").on("click",function(event){
        var e=event||window.event;
        e.stopPropagation();
        localStorage.setItem("PeditValue",$(".headicon").attr("src"));
        WLocation.href("/pages/personal/headicon.html");
    });

    //块修改点击事件
    $(".edit-block").on("click",function(){
        localStorage.setItem("PeditValue",checkundefined($(this).find(".weui_cell_ft").text()));
        WLocation.href("/pages/personal/editinfo.html?type="+$(this).data("block"));
    });

    //头像上传------------------------------------------------

    //监听hash变化
    $(window).on("hashchange",function(){
        if(!window.location.hash){//如果存在hash值
            $(".cropperContain").removeClass("cropperShow");
        }
    });

    //头像点击事件
    $(".uploadIcon").on("click",function(){
        $("#uploadsheet").find("#mask").show().addClass("weui_fade_toggle").next().addClass("weui_actionsheet_toggle");
    });

    //从相册中选择点击事件
    $(".uploadAlbum").on("click",function(){
        $(".uploadInput").trigger("click");
        var $image = $('#ImgPr'),
            options = {
                aspectRatio: 100/100,
                background:false,
                modal:false,
                guides:false,
                highlight:false,
                zoomable:false,
                dragCrop:false,
                autoCropArea:0.7,
                touchDragZoom:false,
                mouseWheelZoom:false,
                viewMode:1,
                crop: function (data) {
                    _x=Math.round(data.x);
                    _y=Math.round(data.y);
                    _width=Math.round(data.width);
                    _height=Math.round(data.height);
                }
            };
        $image.on({}).cropper(options);
    });

    //取消sheet点击事件
    $(".weui_actionsheet_cell,#mask").on("click",function(){
        $("#uploadsheet").find("#mask").hide().removeClass("weui_fade_toggle").next().removeClass("weui_actionsheet_toggle");
    });

    //选中文件
    $(".uploadInput").on("change",function(){
        $(".cropperContain").addClass("cropperShow");
        window.location.hash="upload";
        var _this=document.getElementsByClassName("uploadInput")[0];

        // 可选择的图片类型
        var imgType = [ "bmp", "gif", "png", "jpg","jpeg" ];

        // 拷贝 input 标签覆盖原标签(解决第一次选中同一个图片不触发 change 的 bug)
        var nf = $(_this).clone(true);
        $(_this).parent().append(nf);
        $(_this).remove();

        if (!RegExp(".(" + imgType.join("|") + ")$", "i").test(_this.value.toLowerCase())) {
            tip("图片类型必须是" + imgType.join(",") + "中的一种",2000,$("#error"));
            _this.value = "";
            window.history.back();
            return false;
        }

        // 判断浏览器是否有FileReader接口
        if (typeof FileReader == 'undefined') {
            tip("请使用支持HTML5的浏览器,如Chrome,FireFox等.",2000,$("#error"));
            return false;
        } else {
            var oFReader = new FileReader();
            var $image = $("#ImgPr");
            // 将选择的图片置于 $image 用于重置 Cropper
            oFReader.onload = function (oFREvent) {
                $image.attr('src', oFREvent.target.result).hide();
            };
            var oFile = _this.files[0];
            oFReader.readAsDataURL(oFile);

            var $inputImage = $('.uploadInput'),URL = window.URL || window.webkitURL,blobURL;
            blobURL = URL.createObjectURL(oFile);

            // 重置 Cropper
            $image.one('built.cropper', function () {
                URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset', true).cropper('replace', blobURL);
            $inputImage.val('');
        }
    });

    //上传点击事件
    $(".btn-uploadHead").on("click",function(){
        $("input[type='file']").prop('disabled', true);
        $("#loadingToast").show();

        var can = document.getElementById('ImgPre');    // 获取 canvas 的实例
        var ctx = can.getContext('2d');     // 获取上下文
        var oldImg = document.getElementById('ImgPr');  // 获取原始图片
        ctx.drawImage(oldImg, _x, _y, _width, _height, 0, 0, 500, 500);    // 截取图片

        var dataUrl = can.toDataURL();  // 转换图片
        var base64imgstr=dataUrl.split(",")[1]; // 获取图片 base64
        var type=dataUrl.split(";")[0].split("/")[1];   // 获取图片格式

        $.ajax({
            url:"/file/imgupload.do",
            type:"POST",
            data:{base64imgstr :base64imgstr,name:type},
            dataType:"text",
            complete:function(){
                $("input[type='file']").prop('disabled', false);
                $('#imgpr').cropper('destroy');
                $(".cropperContain").removeClass("cropperShow");
            },
            success:function(e){

                // 用服务器返回的图片地址替换用户头像
                tip("上传成功",2000,$("#right"));
                $(".headicon").attr("src",getUserLogo(e));

                // 更新用户的信息
                var userinfoison="{'headicon':'"+e+"'}";
                $.ajax({
                    url:"/user.do?subtime=1&method=updateUserBaseInfo",
                    data:{
                        userInfoJson:userinfoison
                    },
                    complete:function(){
                        $("#loadingToast").hide();
                    }
                });
                window.history.back();
            }
        });
    });
});