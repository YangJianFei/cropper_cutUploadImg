$(function () {
    var _x, _y,_width,_height;
    //�󶨻�����Ϣ
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
            } else if (data.status == 500 && data.desc == "515002") {//��½�ѹ���
                tip("��¼�ѹ���", 2000, $("#error"));
            } else if (data.status == 500 && data.desc == "515001") {//δ��¼
                tip("δ��¼", 2000, $("#error"));
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
                    $(".email").text("δ��");
                } else if (data.result.authemail != "1") {
                    $(".email").html(data.result.email+"<span class='badge_day'>����֤</span>");
                } else {
                    $(".email").text(data.result.email);
                }
                if(checkundefined(data.result.weixinname)==""){
                    $(".wchat").text("δ��");
                }else{
                    $(".wchat").text(data.result.weixinname);
                }
                localStorage.setItem("infoAuthphone",checkundefined(data.result.authphone));
                localStorage.setItem("wchaticon",data.result.headicon);
            } else {
                tip("��ȡ��Ϣʧ��", 2000, $("#error"));
            }
            $("#loadingToast").hide();
        }
    });

    //ͷ��ͼƬ����¼�
    $(".headicon").on("click",function(event){
        var e=event||window.event;
        e.stopPropagation();
        localStorage.setItem("PeditValue",$(".headicon").attr("src"));
        WLocation.href("/pages/personal/headicon.html");
    });

    //���޸ĵ���¼�
    $(".edit-block").on("click",function(){
        localStorage.setItem("PeditValue",checkundefined($(this).find(".weui_cell_ft").text()));
        WLocation.href("/pages/personal/editinfo.html?type="+$(this).data("block"));
    });

    //ͷ���ϴ�------------------------------------------------

    //����hash�仯
    $(window).on("hashchange",function(){
        if(!window.location.hash){//�������hashֵ
            $(".cropperContain").removeClass("cropperShow");
        }
    });

    //ͷ�����¼�
    $(".uploadIcon").on("click",function(){
        $("#uploadsheet").find("#mask").show().addClass("weui_fade_toggle").next().addClass("weui_actionsheet_toggle");
    });

    //�������ѡ�����¼�
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

    //ȡ��sheet����¼�
    $(".weui_actionsheet_cell,#mask").on("click",function(){
        $("#uploadsheet").find("#mask").hide().removeClass("weui_fade_toggle").next().removeClass("weui_actionsheet_toggle");
    });

    //ѡ���ļ�
    $(".uploadInput").on("change",function(){
        $(".cropperContain").addClass("cropperShow");
        window.location.hash="upload";
        var _this=document.getElementsByClassName("uploadInput")[0];

        // ��ѡ���ͼƬ����
        var imgType = [ "bmp", "gif", "png", "jpg","jpeg" ];

        // ���� input ��ǩ����ԭ��ǩ(�����һ��ѡ��ͬһ��ͼƬ������ change �� bug)
        var nf = $(_this).clone(true);
        $(_this).parent().append(nf);
        $(_this).remove();

        if (!RegExp(".(" + imgType.join("|") + ")$", "i").test(_this.value.toLowerCase())) {
            tip("ͼƬ���ͱ�����" + imgType.join(",") + "�е�һ��",2000,$("#error"));
            _this.value = "";
            window.history.back();
            return false;
        }

        // �ж�������Ƿ���FileReader�ӿ�
        if (typeof FileReader == 'undefined') {
            tip("��ʹ��֧��HTML5�������,��Chrome,FireFox��.",2000,$("#error"));
            return false;
        } else {
            var oFReader = new FileReader();
            var $image = $("#ImgPr");
            // ��ѡ���ͼƬ���� $image �������� Cropper
            oFReader.onload = function (oFREvent) {
                $image.attr('src', oFREvent.target.result).hide();
            };
            var oFile = _this.files[0];
            oFReader.readAsDataURL(oFile);

            var $inputImage = $('.uploadInput'),URL = window.URL || window.webkitURL,blobURL;
            blobURL = URL.createObjectURL(oFile);

            // ���� Cropper
            $image.one('built.cropper', function () {
                URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset', true).cropper('replace', blobURL);
            $inputImage.val('');
        }
    });

    //�ϴ�����¼�
    $(".btn-uploadHead").on("click",function(){
        $("input[type='file']").prop('disabled', true);
        $("#loadingToast").show();

        var can = document.getElementById('ImgPre');    // ��ȡ canvas ��ʵ��
        var ctx = can.getContext('2d');     // ��ȡ������
        var oldImg = document.getElementById('ImgPr');  // ��ȡԭʼͼƬ
        ctx.drawImage(oldImg, _x, _y, _width, _height, 0, 0, 500, 500);    // ��ȡͼƬ

        var dataUrl = can.toDataURL();  // ת��ͼƬ
        var base64imgstr=dataUrl.split(",")[1]; // ��ȡͼƬ base64
        var type=dataUrl.split(";")[0].split("/")[1];   // ��ȡͼƬ��ʽ

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

                // �÷��������ص�ͼƬ��ַ�滻�û�ͷ��
                tip("�ϴ��ɹ�",2000,$("#right"));
                $(".headicon").attr("src",getUserLogo(e));

                // �����û�����Ϣ
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