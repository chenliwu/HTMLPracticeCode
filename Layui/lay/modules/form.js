/**
 @Name：layui.form 表单组件
 @Author：贤心
 @License：MIT
 * form select 做了较大更优化，主要针对点击加载数据 2018-03-16
 * form renderButton 自适应按钮方法 class .layui-form-submit-adaptive
 * select 框优化失去焦点功能
 */
var timer;
layui.define('layer', function(exports){
    "use strict";

    var $ = layui.jquery
        ,layer = layui.layer
        ,hint = layui.hint()
        ,device = layui.device()
        ,MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'

        ,Form = function(){
        this.config = {
            verify: {
                required: [
                    /[\S]+/
                    ,'必填项不能为空'
                ]
                ,phone: [
                    /^1\d{10}$/
                    ,'请输入正确的手机号'
                ]
                ,email: [
                    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                    ,'邮箱格式不正确'
                ]
                ,url: [
                    /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
                    ,'链接格式不正确'
                ]
                ,number: [
                    /^\d+$/
                    ,'只能填写数字'
                ]

                ,date: [
                    /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
                    ,'日期格式不正确'
                ]
                ,datetime: [
                    /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1])) ([0-1]\d{1}|2[0-3]):([0-5]\d{1}):([0-5]\d{1})$/
                    ,'日期格式不正确'
                ]
                ,identity: [
                    /(^\d{15}$)|(^\d{17}(x|X|\d)$)/
                    ,'请输入正确的身份证号'
                ]
                ,langKey:function(value,item){ //新增 liuyj
                    if(/[\u4e00-\u9fa5]/.test(value)){
                        return 'key不能使用中文';
                    }
                }
                ,number1: [
                    /^\d+(\.\d+)?$/ //刘勇军，修改匹配带小数点+数字
                    ,'只能填写数字'
                ]
                ,number2: function(value, item){ //新增 liuyj 非必填大于零数字
                    if(value !=='' && !(/^\d+(\.\d+)?$/.test(value) && value > 0)){
                        return '只能填写大于零的数字!';
                    }
                }
                ,identity1: function(value, item){ // 新增 liuyj 非必填
                    var aCity = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",
                        33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",
                        50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",
                        81:"香港",82:"澳门",91:"国外"};
                    function isCardID(sId){
                        var iSum=0 ;
                        var info="" ;
                        if(sId.length === 15 ){
                            if(!/^\d{15}$/.test(sId)){
                                return false;
                            }else{
                                return true;
                            }
                        }
                        if(!/^\d{17}(\d|x)$/i.test(sId)){
                            return false;
                        }
                        sId = sId.replace(/x$/i,"a");
                        if(aCity[parseInt(sId.substr(0,2))]==null){
                            return false;
                        }
                        var sBirthday = sId.substr(6,4)+"-"+Number(sId.substr(10,2))+"-"+Number(sId.substr(12,2));
                        var d = new Date(sBirthday.replace(/-/g,"/")) ;
                        if(sBirthday!=(d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate())){
                            return false;
                        }
                        for(var i = 17;i>=0;i --){
                            iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11) ;
                        }
                        if(iSum%11!=1){
                            return false;
                        }
                        //aCity[parseInt(sId.substr(0,2))]+","+sBirthday+","+(sId.substr(16,1)%2?"男":"女");//此次还可以判断出输入的身份证号的人性别
                        return true;
                    };
                    // if(value && !/(^\d{15}$)|(^\d{17}(x|X|\d)$)/.test(value)){
                    if(value && !isCardID(value)){
                        return '请输入正确的身份证号';
                    }
                }
                ,phone1: function(value, item){ //新增 liuyj 非必填
                    if(value && !/^1\d{10}$/.test(value)){
                        return '请输入正确的手机号';
                    }
                }
                ,strlength:function(val,item){ //获取字符串长度（汉字算两个字符，字母数字算一个）
                    var len = 0;
                    var maxLen = $(item).data('maxlength'.toLowerCase());
                    var minLen = $(item).data('minlength'.toLowerCase());
                    for (var i = 0; i < val.length; i++) {
                        var a = val.charAt(i);
                        if (a.match(/[^\x00-\xff]/ig) != null) {
                            len += 2;
                        }
                        else {
                            len += 1;
                        }
                    }
                    if(val && maxLen && minLen){
                        if(minLen == maxLen){
                            if(len !=minLen){
                                return '输入的内容长度必须等于'+minLen;
                            }
                        }else if(len < minLen || len > maxLen ){
                            return '输入的内容长度范围必须在'+minLen+'至'+maxLen+'之间';
                        }
                    }else if(val  && maxLen && maxLen < len ){
                        return '输入的内容长度必须小于'+maxLen;
                    }else if(val && minLen && minLen > len ){
                        return '输入的内容长度必须大于'+minLen;
                    }
                }
                ,integer: function(value, item){ //新增 liuyj 正负整数
                    if(value && !/^-?\d+$/.test(value)){
                        return '请输入整数';
                    }
                }
                ,numberOrletter: function(value, item){ //新增 liuyj 数字和字母
                    if(value && !/^[A-Za-z0-9]+$/.test(value)){
                        return '只能输入数字或字母';
                    }
                }
                ,letter: function(value, item){ //新增 liuyj 字母
                    if(value && !/^[A-Za-z]+$/.test(value)){
                        return '只能输入字母';
                    }
                }, email1: function(value, item){ //新增 liuyj 非必填emial
                    if(value && !/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)){
                        return '邮箱格式不正确';
                    }
                }
            }
        };
    };


    //全局设置
    Form.prototype.set = function(options){
        var that = this;
        $.extend(true, that.config, options);
        return that;
    };

    //验证规则设定
    Form.prototype.verify = function(settings){
        var that = this;
        $.extend(true, that.config.verify, settings);
        return that;
    };

    //表单事件监听
    Form.prototype.on = function(events, callback){
        return layui.onevent(MOD_NAME, events, callback);
    };

    //表单控件渲染
    Form.prototype.render = function(type,filter){
        var that = this,
            //layui2.0 参数 刘勇军
            elemForm = $(ELEM + function(){
                    return filter ? ('[lay-filter="' + filter +'"]') : '';
                }());

        var  items = {

            //下拉选择框
            select: function(){
                var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
                    ,NONE = 'layui-select-none', initValue = '', thatInput,index=-1,isClickDocument = false //回车或点击dd时，设置为false;

                    ,isClickBodyForInputValue = false //可输入下拉框点击body时赋值标识
                    // ,selects = $(ELEM).find('select'), hide = function(e, clear){
                    ,selects = elemForm.find('select:not(.initSelect)'), hide = function(e, clear){
                        if(!$(e.target).parent().hasClass(TITLE) || clear){
                            $('.'+CLASS).removeClass(CLASS+'ed');
                            // thatInput && initValue && thatInput.val(initValue);
                            if( isClickBodyForInputValue && thatInput){ //支持额外值输入功能，当点击body时触发回调
                                isClickBodyForInputValue = false;
                                var text = $.trim(thatInput.val());
                                var dds = thatInput.parent().siblings('dl').find('dd');
                                var select = thatInput.parent().parent().siblings('select');
                                var filter = select.attr('lay-filter');
                                if( text === ''){ //输入框无值时
                                    if( dds.hasClass(THIS) ){ //如果下拉框有选中样式，则删除样式并执行回调，即清空操作
                                        dds.removeClass(THIS);
                                        select.val(text).removeClass('layui-form-danger');
                                        layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                            elem: select[0]
                                            ,value: text
                                            ,othis: thatInput.parent().parent()
                                        });
                                    }
                                    thatInput = null;
                                    return false;
                                }
                                var isExtraValue = true;//默认为是额外的值
                                layui.each(dds,function(){
                                        var value = $(this).text();
                                        if( text !== '' && text == value ){ //text要有值，否则会出现text等于空也进入下面方法，造成不输入值，鼠标失去焦点，inputvalue被选中
                                            isExtraValue = false;//找到了，就不是额外的值
                                        }
                                    })
                                if( isExtraValue ){ //额外值时
                                    var index = select.find('.extra').index();//获取额外值添加的index
                                    if(index !== -1){ //找到了位置时,添加额外值，执行回调
                                        dds.eq(index).attr("lay-value",text).text(text);
                                        dds.eq(index).addClass(THIS).siblings().removeClass(THIS);
                                        select.find("option").eq(index).val(text).text(text);
                                        select.val(text).removeClass('layui-form-danger');
                                        layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                            elem: select[0]
                                            ,value: text
                                            ,othis: thatInput.parent().parent()
                                        });
                                    }
                                }else{ //恢复原来的值
                                    var selectedValue = select.val();
                                    var beforeText  = thatInput.parent().siblings('dl').find('[lay-value="'+selectedValue+'"]').text();
                                    thatInput.parent().siblings('dl').find('[lay-value="'+selectedValue+'"]').addClass(THIS).siblings().removeClass(THIS);
                                    thatInput.val( beforeText );
                                }
                            }
                        }
                        thatInput = null;
                    }

                    ,events = function(reElem, disabled, isSearch,inputValue){
                        var select = $(this)
                            ,title = reElem.find('.' + TITLE)
                            ,input = title.find('input')
                            ,dl = reElem.find('dl')
                            ,dds = dl.children('dd'),
                            isDown = select.parents('.isDown').length >0 ? true:false //设置下拉框固定在下面展开

                        if(disabled) return;

                        //展开下拉
                        var showDown = function(){
                            //layui2.0 添加的定位
                            var top = reElem.offset().top + reElem.outerHeight() + 5 - win.scrollTop()
                                ,dlHeight = dl.outerHeight();

                            reElem.addClass(CLASS+'ed');
                            dds.removeClass(HIDE);
                            //上下定位识别 layui2.0 liuyj
                            if(top + dlHeight > win.height() && top >= dlHeight && !isDown){
                                reElem.addClass(CLASS + 'up');
                                //if($(this).siblings("div.layui-form-select").hasClass('layui-form-selectup')){
                                //    $(this).siblings("div.layui-form-select").find("dl").css("top","auto");
                                //}else{
                                //    $(this).siblings("div.layui-form-select").find("dl").css("top","32px");
                                //}
                            }
                            //添加部分，解决有滚动条时，需要滚动条滚动，让选中的可见 liuyj
                            // 判断是否有滚动条
                            var flag = dl[0].scrollHeight > dl[0].clientHeight;
                            if(flag){
                                var showdds = dl.children('dd:visible')
                                var ddHeight = dds.height();//行高
                                // 检验到第几行时才滚动
                                var stage = Math.floor(dl[0].clientHeight/ddHeight)-1;
                                //获取选中的元素;
                                var selectedElem = dl.find('.' + THIS);
                                var ddIndex = showdds.index(selectedElem);
                                index = ddIndex;
                                if(ddIndex > stage){
                                    var totop = dl.scrollTop() - ddHeight*(stage - ddIndex);
                                    dl.scrollTop(totop)
                                }
                                if(showdds.length !== dds.length){
                                    index = -1;
                                }
                            }

                        }, hideDown = function(choose){
                            reElem.removeClass(CLASS+'ed'+' '+ CLASS+'up');
                            input.blur();

                            if(choose) return;

                            notOption(input.val(), function(none){
                                if(none){
                                    var length = dl.find('.' + THIS).length;
                                    if (length > 1)
                                    {
                                        //多选，什么都不做
                                    }else{
                                        initValue = dl.find('.'+THIS).html();
                                        input && input.val(initValue);
                                    }
                                }
                            });
                        };
                        //根据传入的index，判断上或下一个dd是否为disabled;
                        var indexUpdate = function(index,keycode,dds){
                            var maxIndex = dds.length -1 ;
                            if(keycode === 40 || keycode === 38){
                                if(index <= maxIndex ){
                                    if(index === maxIndex){
                                        if(keycode === 40){
                                            return index;
                                        }else{
                                            index--;//正常情况下的index 运算;
                                        }
                                    }else{
                                        keycode === 40 ? index++ : index--;//正常情况下的index 运算;
                                    }
                                    if( $(dds[index]).hasClass(DISABLED)){
                                        if(index === maxIndex){
                                            keycode === 40 ? index -- : index ++; //最后一个index 运算;
                                        }
                                        index = indexUpdate(index,keycode,dds)
                                    }
                                }
                                // if(index === maxIndex && $(dds[index]).hasClass(DISABLED) ){
                                //
                                // }
                                return index;
                            }
                        }

                        //点击标题区域
                        title.on('click', function(e){
                            //取消冒泡事件
                            // e.stopPropagation();
                            reElem.hasClass(CLASS+'ed') ? (
                                hideDown()
                            ) : (
                                hide(e, true),
                                    showDown()

                            );
                            dl.find('.'+NONE).remove();
                            //判断是否已经加载了数据；
                            var wrapDiv = reElem.parent();
                            var initData = wrapDiv.data('initdata');
                            if(wrapDiv.hasClass('bt-biz-selectType') && !initData && reElem.hasClass(CLASS+'ed')){
                                wrapDiv.data('initdata','true');
                                var getData = wrapDiv.data('get');//加载数据的方法
                                typeof getData ==='function' && getData(wrapDiv);
                            }

                        });

                        //点击箭头获取焦点
                        title.find('.layui-edge').on('click', function(){
                            input.focus();

                        });

                        //键盘事件
                        input.on('keyup', function(e){
                            var keyCode = e.keyCode;
                            //Tab键
                            if(keyCode === 9){
                                showDown();
                            }
                        }).on('focus',function(){

                            setTimeout(function(){
                                if(!reElem.hasClass(CLASS+'ed')){
                                    showDown();
                                }
                            }, 400);

                        }).on('keydown', function(e){
                            isClickDocument = true;//开启点击document 开关
                            var keyCode = e.keyCode;
                            //添加内容开始
                            var showdds = dl.children('dd:visible')
                            // var container = dds.parent();
                            var flag = dl[0].scrollHeight > dl[0].clientHeight;
                            var ddHeight = dds.height();//行高
                            // 检验到第几行时才滚动
                            var stage = Math.floor(dl[0].clientHeight/ddHeight)-2;
                            var selectedElem = dl.find('.'+THIS);
                            index = showdds.index(selectedElem);
                            var filter = select.attr('lay-filter'); //获取过滤器
                            var mulselectFlag = false;//判定是否是多选下拉框
                            // if(dl.parents('.bt-biz-mulselectType').length != 0 || dl.parents('.bt-biz-dict').length !=0){ //多选下拉框判断
                            if(dl.parents('.bt-biz-mulselectType').length != 0 || dl.parents('[data-type="mulselect"]').length !=0){ //多选下拉框判断
                                mulselectFlag = true;
                            }
                            //Tab键
                            if(keyCode === 9){
                                hideDown();
                            } else if(keyCode === 13 && !mulselectFlag){ //回车键
                                //实现回车选中  liuyj
                                var othis = $(this);
                                var filter = select.attr('lay-filter'); //获取过滤器
                                isClickBodyForInputValue = false;//取消可以点击body执行回调方法
                                var text = othis.val();
                                var isExtraValue = true;//额外值标识
                                bt.each(dds,function(){
                                   var currentDdText = $(this).text();
                                   if( text !==''){
                                       if( text == currentDdText ){
                                           isExtraValue = false;
                                       }
                                   }
                                })
                               if( isExtraValue ){ //是额外值
                                   if( inputValue ){ //支持额外输入参数功能 向对应的额外标签中添加内容，并执行回调
                                       var index = select.find('.extra').index();
                                       if(index !== -1){
                                           dds.eq(index).attr("lay-value",text).text(text);
                                           dds.eq(index).addClass(THIS).siblings().removeClass(THIS);
                                           select.find("option").eq(index).val(text).text(text);
                                           select.val(text).removeClass('layui-form-danger');
                                           layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                               elem: select[0]
                                               ,value: text
                                               ,othis: othis.parent().parent()
                                           });
                                       }
                                   }else{ //恢复原来的值
                                       var selectedValue = select.val();
                                       var beforeText  = thatInput.parent().siblings('dl').find('[lay-value="'+selectedValue+'"]').text();
                                       thatInput.parent().siblings('dl').find('[lay-value="'+selectedValue+'"]').addClass(THIS).siblings().removeClass(THIS);
                                       thatInput.val( beforeText );
                                   }
                               }else{ //非常额外值，回车执行选中事件
                                   var ddValue = dl.find('.'+THIS).attr('lay-value');
                                   var selectedValue = select.val();
                                   if( ddValue !== selectedValue ){ //回车时select 值与dd值相当时，不执行回调
                                       select.val(ddValue);
                                       layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                           elem: select[0]
                                           ,value: ddValue
                                           ,othis: othis.parent().parent()
                                       });
                                       select.removeClass('layui-form-danger')
                                   }
                               }
                                hideDown();

                                //回车切换下一个input框
                                that.enterToNextInput($(this))
                                return false;

                            }else if (( keyCode === 38 || keyCode === 40 ) && !mulselectFlag){ //向上38，向下40，回车13 liuyj
                                isClickBodyForInputValue = true;
                                index = indexUpdate(index,keyCode,showdds)
                                var othis = $(showdds[index]);
                                var text = othis.text();
                                if(!text){ //解决下拉框中无内容的inputValue项的问题
                                    index = indexUpdate(index,keyCode,showdds);
                                    othis = $(showdds[index]);
                                }
                                var value = othis.attr('lay-value');

                                if( keyCode === 38 ){ //38向上时
                                    if((showdds.length - index) > stage){
                                        if(flag){
                                            var totop = dl.scrollTop() - ddHeight;
                                            dl.scrollTop(totop)
                                        }
                                    }
                                }else{ //40向下
                                    if(index > stage){
                                        if(flag){
                                            var top = (index - stage)*ddHeight;
                                            dl.scrollTop(top)
                                        }
                                    }
                                }
                                //select.val(value).removeClass('layui-form-danger'), input.val(othis.text());
                                input.val(othis.text());
                                othis.addClass(THIS).siblings().removeClass(THIS);
                            }

                        });

                        //检测值是否不属于select项
                        var notOption = function(value, callback, origin){
                            var num = 0;
                            layui.each(dds, function(){
                                var othis = $(this)
                                    ,text = othis.text()
                                    ,not = text.indexOf(value) === -1;
                                if(value === '' || (origin === 'blur') ? value !== text : not) num++;
                                origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);
                            });
                            var none = num === dds.length;
                            return callback(none), none;
                        };

                        //搜索匹配
                        var search = function(e){
                            var value = this.value, keyCode = e.keyCode;
                            if(keyCode === 9 || keyCode === 13
                                || keyCode === 37 || keyCode === 38
                                || keyCode === 39 || keyCode === 40
                            ){
                                return false;
                            }

                            notOption(value, function(none){
                                if(none){
                                    dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">无匹配项</p>');
                                } else {
                                    dl.find('.'+NONE).remove();
                                }
                            }, 'keyup');

                            if(value === ''){
                                dl.find('.'+NONE).remove();
                            }
                        };
                        //刘勇军 为了让select可以输入值
                        // if(isSearch){
                        //     input.on('keyup', search).on('blur', function(e){
                        //         thatInput = input;
                        //         initValue = dl.find('.'+THIS).html();
                        //         setTimeout(function(){
                        //             notOption(input.val(), function(none){
                        //                 if(none && !initValue){
                        //                     input.val('');
                        //                 }
                        //             }, 'blur');
                        //         }, 200);
                        //     });
                        // }
                        //实现在下拉框可以输入值的功能
                        //var flag = true;
                        //if(isSearch){
                        //    input.on('keyup', search).on('blur', function(e){
                        //        thatInput = input;
                        //        var flag =false,text ='';
                        //        dds = reElem.find('dd');//由于动态加载数据了，dds要重新获取
                        //
                        //        var filter = select.attr('lay-filter');
                        //        if(!inputValue){ //无输入功能的下拉框
                        //            initValue = dl.find('.'+THIS).text();
                        //            setTimeout(function(){
                        //                notOption(input.val(), function(none){
                        //                    // if(none && !initValue){
                        //                    if ( none && !dds.eq(0).hasClass('layui-disabled')){
                        //                        input.val('');
                        //                        dds.eq(0).addClass(THIS).siblings().removeClass(THIS);
                        //                        select.val(' ').removeClass('layui-form-danger');
                        //                        //有选择时，再清空需要回调
                        //                        if(initValue){
                        //                            layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                        //                                elem: select[0]
                        //                                ,value: ''
                        //                                ,othis: reElem
                        //                            });
                        //                        }
                        //                    }else{
                        //                        if( initValue && initValue != input.val()){
                        //                            input.val( initValue );
                        //                        }
                        //
                        //                    }
                        //                }, 'blur');
                        //            }, 200);
                        //
                        //        }else{
                        //            text = input.val();
                        //            var selectedValue;//与下拉框dl匹配对应的value
                        //            var selectedDisabled = false;//选中的值是否是禁用的值
                        //            layui.each(dds,function(){
                        //                var value = $(this).text();
                        //                if(text && text == value ){ //text要有值，否则会出现text等于空也进入下面方法，造成不输入值，鼠标失去焦点，inputvalue被选中
                        //
                        //                    if($(this).hasClass(DISABLED)){
                        //                        input.val('');
                        //                        selectedDisabled = true;
                        //                    }else{
                        //                        selectedValue = $(this).attr('lay-value');
                        //                    }
                        //                    flag = true;
                        //                }
                        //                if(!text){ //当输入框无值时，鼠标失去焦点，清除被选中状态
                        //                    $(this).removeClass(THIS);
                        //                    input.val('');
                        //                }
                        //            })
                        //            if(!flag || selectedDisabled){ //selectedDisabled 当输入的值为禁用值时，input被清空，失去焦点时，把上一次被选中也清除掉
                        //                isClickBodyForInputValue = true;
                        //            }
                        //        }
                        //        //键盘上下或输入匹配选择时，失去焦点回调点击 document时回调  liuyj
                        //        if( isClickDocument && !isClickBodyForInputValue){
                        //            isClickDocument = false;
                        //            if( flag && selectedValue ){ //flag && selectedValue 代表输入的值匹配到了下拉框的值，失焦点回调(非点击)
                        //                var othis = null;
                        //                if(flag){
                        //                    othis = dl.find('[lay-value ="'+selectedValue+'"]');
                        //                }else{
                        //                    othis = dl.find('.' + THIS);
                        //                }
                        //                flag = false;
                        //                console.log('keyup');
                        //                var value = othis.attr('lay-value');
                        //                select.val(value).removeClass('layui-form-danger'), input.val(othis.text());
                        //                othis.addClass(THIS).siblings().removeClass(THIS);
                        //                layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                        //                    elem: select[0]
                        //                    ,value: value
                        //                    ,othis: reElem
                        //                });
                        //            }
                        //        }
                        //    });
                        //}

                    //优化为失去焦点不选中
                    if(isSearch){
                        input.on('keyup', search).on('blur', function(e){
                            thatInput = input;
                            var flag =false,text ='';
                            dds = reElem.find('dd');//由于动态加载数据了，dds要重新获取
                            var filter = select.attr('lay-filter');
                            if(!inputValue){ //无输入功能的下拉框
                                initValue = dl.find('.'+THIS).text();
                                setTimeout(function(){
                                    notOption(input.val(), function(none){
                                        // if(none && !initValue){
                                        if( none && !input.val() &&  initValue ){ // none匹配不上时为true,input无值，而初始时有值，调用回调并清空
                                            dds.removeClass(THIS);
                                            select.val('').removeClass('layui-form-danger');
                                            layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                                elem: select[0]
                                                ,value: ''
                                                ,othis: reElem
                                            });
                                        }else{
                                            var selectedValue = select.val();
                                            var beforeText  = dl.find('[lay-value="'+selectedValue+'"]').text();
                                            dl.find('[lay-value="'+selectedValue+'"]').addClass(THIS).siblings().removeClass(THIS);
                                            input.val( beforeText );
                                        }
                                    }, 'blur');
                                }, 200);

                            }else{
                                text = $.trim( input.val());
                                if(text === ''){ //输入框无值
                                    if( dds.hasClass(THIS)){ //有选择内容，需要清空，并执行回调
                                        dds.removeClass(THIS);
                                        select.val('').removeClass('layui-form-danger');
                                        layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                            elem: select[0]
                                            ,value:text
                                            ,othis: reElem
                                        });
                                        isClickBodyForInputValue = false;
                                    }
                                    return false;
                                }
                                var isExtraValue = true;//额外值
                                layui.each(dds,function(){
                                    var value = $(this).text();
                                    if( text !==''){
                                        if(text == value){
                                            isExtraValue = false;
                                        }
                                    }
                                })
                                if(isExtraValue){ //如果是额值，回车或者点击body时，会执行添加动作，并执行回调
                                    isClickBodyForInputValue = true;//设置可以执行点击body标识
                                    // 赋值
                                    var index = select.find('.extra').index();//获取额外值添加的index
                                    if(index !== -1){ //找到了位置时,添加额外值，执行回调
                                        dds.eq(index).attr("lay-value",text).text(text);
                                        dds.eq(index).addClass(THIS).siblings().removeClass(THIS);
                                        select.find("option").eq(index).val(text).text(text);
                                        select.val(text).removeClass('layui-form-danger');
                                        layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                            elem: select[0]
                                            ,value: text
                                            ,othis: thatInput.parent().parent()
                                        });
                                    }
                                    isClickBodyForInputValue = false;//设置可以执行点击body标识
                                }
                            }
                        });
                    }
                        //选择
                        //dds.off('click');
                        reElem.on('click','dd',function(){
                        //dds.off('click').on('click', function(){
                            if($(this).hasClass(DISABLED)){
                                isClickBodyForInputValue = true;
                                return false;
                            }
                            isClickBodyForInputValue = false;
                            var othis = $(this), value = othis.attr('lay-value');
                            var filter = select.attr('lay-filter'); //获取过滤器
                            var text = input.val();
                            var ddText = othis.text();
                            // 解决点击相同内容时，不触发回调
                            if(!othis.hasClass(THIS)){
                                select.val(value).removeClass('layui-form-danger'), input.val(othis.text());
                                othis.addClass(THIS).siblings().removeClass(THIS);
                                layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
                                    elem: select[0]
                                    ,value: value
                                    ,othis: reElem
                                });
                            }else{
                                input.val( othis.text());
                            }
                            hideDown();
                            return false;
                        });

                        reElem.find('dl>dt').on('click', function(e){
                            return false;
                        });

                        //关闭下拉
                        $(document).off('click', hide).on('click', hide);
                    }
                selects = elemForm.find('select:not(.initSelect)');
                selects.each(function(index, select){
                    var othis = $(this), hasRender = othis.next('.'+CLASS), disabled = this.disabled;
                    var value = select.value, selected = $(select.options[select.selectedIndex]); //获取当前选中项
                    value = $.trim(value);//去除value空格 liuyj

                    var selectWid = othis.data("width");//添加设置下拉框宽度方法 liuyj

                    if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

                    var isSearch = typeof othis.attr('lay-search') === 'string';
                    // var inputValue = othis.attr("data-inputValue") =='true';
                    var inputValue = false;
                    var inputValueInfor = othis.data("inputvalue");
                    if(inputValueInfor =='false' || inputValueInfor =='' || inputValueInfor== undefined ){
                        inputValue = false;
                    }else{
                        inputValue = true;
                    }

                    var e = $(this).attr("multiple") ==="multiple";
                    //新增加开始 liuyj
                    var placeholder ='';
                    if(select.options.length !==0){ //当下拉框没有option时，直接等于''
                        placeholder = select.options[0].innerHTML ? select.options[0].innerHTML : TIPS;
                    }
                    if( othis.find('option[value="inputText"]:not(.extra)').length ){ //给可输入下拉框添加自定义标识
                        othis.find('option[value="inputText"]:not(.extra)').addClass('extra');
                    }
                    //新增加结束  liuyj
                    //替代元素
                    var reElem = $(['<div class="layui-unselect '+ CLASS + (disabled ? ' layui-select-disabled' : '') +'">'
                        ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ placeholder +'" value="'+ (value ? selected.html() : '') +'" '+ (isSearch ? '' : 'readonly') +' class="layui-input layui-unselect'+ (disabled ? (' '+DISABLED) : '') +'" '+ (selectWid ? 'style="width:'+selectWid+'"' : '') +' '+(disabled ? 'disabled':'')+'>'
                        ,'<i class="layui-edge"></i></div>'
                        ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
                            var arr = [];
                            layui.each(options, function(index, item){
                                if(index === 0 && !item.value) return;
                                if(item.tagName.toLowerCase() === 'optgroup'){
                                    arr.push('<dt>'+ item.label +'</dt>');
                                } else {
                                    arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
                                }
                            });
                            arr.length === 0 && arr.push('<dd lay-value="" class="'+ DISABLED +'">没有选项</dd>'); // layui2.0 liuyj
                            return arr.join('');
                        }(othis.find('*')) +'</dl>'
                        ,'</div>'].join(''));

                    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
                    othis.after(reElem);
                    events.call(this, reElem, disabled, isSearch,inputValue,name);
                });
            }
            //复选框/开关
            ,checkbox: function(){
                var CLASS = {
                    checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
                    ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
                }
                    ,checks = elemForm.find('input[type=checkbox]')

                    ,events = function(reElem, RE_CLASS){
                    var check = $(this);

                    //勾选
                    reElem.on('click', function(){
                        var filter = check.attr('lay-filter') //获取过滤器
                            ,text = (check.attr('lay-text')||'').split('|');

                        if(check[0].disabled) return;

                        check[0].checked ? (
                            check[0].checked = false
                                ,reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
                        ) : (
                            check[0].checked = true
                                ,reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
                        );

                        layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
                            elem: check[0]
                            ,value: check[0].value
                            ,othis: reElem
                        });
                    });
                }

                checks.each(function(index, check){
                    var othis = $(this), skin = othis.attr('lay-skin')
                        ,text = (othis.attr('lay-text')||'').split('|'), disabled = this.disabled;
                    if(skin === 'switch') skin = '_'+skin;
                    var RE_CLASS = CLASS[skin] || CLASS.checkbox;

                    if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

                    //替代元素
                    var hasRender = othis.next('.' + RE_CLASS[0]);
                    var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0] + (
                        check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disbaled '+DISABLED : '') +'" lay-skin="'+ (skin||'') +'">'
                        ,{
                            _switch: '<em>'+ ((check.checked ? text[0] : text[1])||'') +'</em><i></i>'
                        }[skin] || ((check.title.replace(/\s/g, '') ? ('<span>'+ check.title +'</span>') : '') +'<i class="layui-icon">'+ (skin ? '&#xe605;' : '&#xe618;') +'</i>')
                        ,'</div>'].join(''));

                    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
                    othis.after(reElem);
                    events.call(this, reElem, RE_CLASS);
                });
            }
            //单选框
            ,radio: function(){
                var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
                    ,radios = elemForm.find('input[type=radio]')

                    ,events = function(reElem){
                    var radio = $(this), ANIM = 'layui-anim-scaleSpring';

                    reElem.on('click', function(){
                        var name = radio[0].name, forms = radio.parents(ELEM);
                        var filter = radio.attr('lay-filter'); //获取过滤器
                        var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟

                        if(radio[0].disabled) return;

                        layui.each(sameRadio, function(){
                            var next = $(this).next('.'+CLASS);
                            this.checked = false;
                            next.removeClass(CLASS+'ed');
                            next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
                        });

                        radio[0].checked = true;
                        reElem.addClass(CLASS+'ed');
                        reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);

                        layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
                            elem: radio[0]
                            ,value: radio[0].value
                            ,othis: reElem
                        });
                    });
                };

                radios.each(function(index, radio){
                    var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;

                    if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

                    //替代元素
                    var reElem = $(['<div class="layui-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' layui-radio-disbaled '+DISABLED : '') +'">'
                        ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
                        ,'<span>'+ (radio.title||'未命名') +'</span>'
                        ,'</div>'].join(''));

                    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
                    othis.after(reElem);
                    events.call(this, reElem);
                });
            }
        };
        type ? (
            items[type] ? items[type]() : hint.error('不支持的'+ type + '表单渲染')
        ) : layui.each(items, function(index, item){
            item();
        });
        return that;
    };

    Form.prototype.verifyFun = function(elem){
        var that = this,reResult = false, stop = null,DANGER = 'layui-form-danger',verify = form.config.verify,$container;

        if(typeof(elem) !== 'string' && typeof(elem) !== 'object') {
            throwError('form error: elem参数未定义或设置出错，具体设置格式请参考文档API.');
        }
        if(typeof(elem) === 'string') {
            $container = $('' + elem + '');
        }
        if(typeof(elem) === 'object') {
            $container = elem;
        }
        var verifyElem = $container.find('*[lay-verify]');

        layui.each(verifyElem, function(_, item){
            if(!($(item).parents(".ignore-required-hide").length > 0 && $(item).parents(".ignore-required-hide").css('display') == 'none')){
                //刘勇军，如果验证的标签display 为none 且不是select，将不对其进行验证
                var othis = $(this), ver = othis.attr('lay-verify').split('|');
                var tips = '', value = othis.val();
                value = $.trim(value);//添加去除空格
                othis.removeClass(DANGER);
                layui.each(ver, function(_, thisVer){
                    var isFn = typeof verify[thisVer] === 'function';
                    //刘勇军 对有千分位的数字进行处理验证
                    // if(thisVer =='number'){
                    //     if(value.indexOf(',') !==-1){
                    //         value = value.replace(/\,/g,'');
                    //     }
                    // }
                    if(othis.hasClass('bt-biz-moneyType')){
                        var separator = othis.data('separator');
                        separator = separator ? separator:',';
                        if(value.indexOf(separator) !==-1){
                            value = value.replace(eval('/\\'+separator+'/g'),'');
                        }
                    }
                    if(verify[thisVer] && (isFn ? tips = verify[thisVer](value, item) : !verify[thisVer][0].test(value)) ){
                        layer.msg(tips || verify[thisVer][1], {
                            icon: 5
                            ,shift: 6
                        });
                        //非移动设备自动定位焦点
                        if(!device.android && !device.ios){
                            item.focus();
                        }
                        othis.addClass(DANGER);
                        return stop = true;
                    }
                });
            }
            if(stop) return stop;
        });
        reResult = !stop;
        return reResult;
    }

    //表单提交校验
    var submit = function(){
        var button = $(this), verify = form.config.verify, stop = null
            ,DANGER = 'layui-form-danger', field = {} ,elem = button.parents(ELEM)
            ,verifyElem = elem.find('*[lay-verify]') //获取需要校验的元素
            ,formElem = button.parents('form')[0] //获取当前所在的form元素，如果存在的话
            ,fieldElem = elem.find('input,select,textarea') //获取所有表单域
            ,filter = button.attr('lay-filter'); //获取过滤器
        //新增复选框的校验，设置一个变量接收name值 liuyj
        var checkboxsName =[];
        // 开始校验
        layui.each(verifyElem, function(_, item){
            // if($(item)[0].tagName =='SELECT' || $(item).css('display') != 'none' ){
            if(!($(item).parents(".ignore-required-hide").length > 0 && $(item).parents(".ignore-required-hide").css('display') == 'none')){
                //刘勇军，如果验证的标签display 为none 且不是select，将不对其进行验证
                var othis = $(this), ver = othis.attr('lay-verify').split('|');
                var tips = '', value = othis.val();
                value = $.trim(value);//添加去除空格
                othis.removeClass(DANGER);
                //新增加复选框的校验 liuyj
                if(othis[0].type ==='checkbox' || othis[0].type ==='radio' ){
                    var name = othis.attr('name');
                    var checkboxParent = othis.parent();
                    if( checkboxParent.find('input[name="'+name+'"]:checked').length === 0){
                        layer.msg(tips || verify['required'][1], {
                            icon: 5
                            ,shift: 6
                        });
                        //非移动设备自动定位焦点
                        if(!device.android && !device.ios){
                            item.focus();
                        }
                        return stop = true;
                    }
                }
                layui.each(ver, function(_, thisVer){
                    var isFn = typeof verify[thisVer] === 'function';
                    //刘勇军 对有千分位的数字进行处理验证
                    // if(thisVer =='number'){
                    //     if(value.indexOf(',') !==-1){
                    //         value = value.replace(/\,/g,'');
                    //     }
                    // }
                    if(othis.hasClass('bt-biz-moneyType')){
                        var separator = othis.data('separator');
                        separator = separator ? separator:',';
                        if(value.indexOf(separator) !==-1){
                            value = value.replace(eval('/\\'+separator+'/g'),'');
                        }
                    }
                    if(verify[thisVer] && (isFn ? tips = verify[thisVer](value, item) : !verify[thisVer][0].test(value))){
                        layer.msg(tips || verify[thisVer][1], {
                            icon: 5
                            ,shift: 6
                        });
                        //非移动设备自动定位焦点
                        if(!device.android && !device.ios){
                            item.focus();
                        }
                        othis.addClass(DANGER);
                        return stop = true;
                    }
                });
            }
            if(stop) return stop;
        });
        if(stop) return false;


        // layui.each(fieldElem, function(_, item){
        //
        //     if(!item.name) return;
        //     if(/^checkbox|radio$/.test(item.type) && !item.checked) return;
        //     field[item.name] = item.value;
        //     console.log(item.name +":"+item.value);
        // });

        //checkbox提交by：周亮
        var multiCheckbox = [];//用于存储是否为多个checkbox
        layui.each(fieldElem, function(_, item){

            if(!item.name) return;
            if(/^checkbox|radio$/.test(item.type)){
                if("radio"===item.type && !item.checked){
                    return;
                }
                if("checkbox"===item.type){
                    var laySkin = item.getAttribute("lay-skin");
                    if(laySkin!=="primary" && !item.checked){
                        return;
                    }
                    if(!field[item.name] ){
                        field[item.name] = "";
                    }
                    if(!item.checked){
                        return;
                    }
                    //获取form表单中checkbox数量是否为多个
                    multiCheckbox[item.name] = $('[name="'+item.name+'"]').length > 1;
                    if(field[item.name]===""){
                        if(multiCheckbox[item.name]){
                            field[item.name] = [];
                        }
                    }
                    if(multiCheckbox[item.name]){
                        field[item.name].push(item.value);
                    }else{
                        field[item.name] = item.value;
                    }
                    return;
                }
            }
           // field[item.name] = item.value;
            field[item.name] = $.trim( item.value ); //删除数据的前后空格  liuyj 2018-05-25
        });

        var BTNDISABLED = 'layui-btn-disabled';
        if(button.hasClass(BTNDISABLED)){
            return false;
        }
        //模拟loading
        var n = 0;timer = setInterval(function(){
            n = n + 26;
            if(n>100){
                n = 100;
                clearInterval(timer);
                button.removeClass(BTNDISABLED);
            }
        },300);
        button.addClass(BTNDISABLED);
        //获取字段
        return layui.event.call(this, MOD_NAME, 'submit('+ filter +')', {
            elem: this
            ,form: formElem
            ,field: field
        });
    };

    //添加必填样式方法 刘勇军 ignore-required-icon 不需要添加
    Form.prototype.addrequiredIcon = function(){
        var vElem = $(".layui-form:not(.ignore-required-icon)").find('*[lay-verify],*[data-required = "true"]');//如果data-required = true 也需要设置必须项
        layui.each(vElem, function(_, item){
            var $this = $(this);
            //如果父元素有class .ignore-required-icon return
            if($(this).parents('.ignore-required-icon').length === 1 || $(this).hasClass('ignore-required-icon')){
                return;
            }
            var ver = $this.attr('lay-verify') !== undefined ? $this.attr('lay-verify') : $this.attr('data-required');
            if( (typeof ver ==='string' && ver.indexOf("required") != -1 )|| ver == "true"){
                var td = $this.closest("td").prev("td");
                var text = $(td).html();
                if(text && text.indexOf("*") ==-1){
                    if($(td).find("div").length !==0){
                        $(td).find("div").prepend('<span class="pl"><span class="required-icon">*</span></span>')
                    }else{
                        $(td).html('<span class="pl"><span class="required-icon">*</span></span>'+text)
                    }
                }
            }
        })
    }

    //删除必填样式方法 刘勇军 ignore-required-icon 不需要添加
    Form.prototype.delrequiredIcon = function(){
        var nElem = $(".layui-form").find('.required-icon');
        layui.each(nElem, function(_, item){
            if($(this).parents('.ignore-required-icon').length === 0){
                var td = $(this).parents("td");
                var verE = td.next("td").find('*[lay-verify],*[data-required = "true"]');//如果data-required = true 也需要设置必须项
                var ver = verE.attr('lay-verify') !== undefined ? verE.attr('lay-verify'):verE.attr('data-required');
                if(ver !== true){
                    if((ver && ver.indexOf("required") === -1 && ver !='true') || !ver ){
                        if(td.find("span.pl").length !==0){
                            td.find("span.pl").remove()
                        }
                    }
                }

            }

        })
    }

    //必填标识重置
    Form.prototype.renderIcon = function(){
        form.addrequiredIcon();
        form.delrequiredIcon();
    }
    //新增加校验回调方法
    Form.prototype.makeCallBack = function (callBack) {
        //校验回调方法是否存在
        if (callBack && typeof(callBack) != "function") {
            try {
                callBack = eval(callBack);
            } catch (e) {
                alert(callBack + 'not exist！');
            }

        }
        return callBack;
    }
    // 自定义组件重置方法
    Form.prototype.resetComponentType = function(filter){
        var that = this;
        //layui2.0 参数 刘勇军
        var elemForm = $(ELEM + function(){
                return filter ? ('[lay-filter="' + filter +'"]') : '';
            }());
        var typeArr =['moneyType','rateType','dateType','mulselectType','dict','selectTableType','accountTable'];//重置的组件有货币/利率/时间
        for(var i = 0;i < typeArr.length;i++){
            resetType(elemForm,typeArr[i])
        }
        var linkInputs = elemForm.find('input[data-link]');//设置关联参数data-link 属性，当linkinput框无内容时，其它关联div清空
        bt.each(linkInputs,function(){
            var id = $(this).data('link');
            var value = $(this).val();
            if(value == ''){
                $('#'+id).text('');
            }
        })
        //新增加重置回调方法
        var resetButton = elemForm.find('button[type="reset"]');
        var callback  = resetButton.data('callback');
        callback = that.makeCallBack(callback);
        if(callback){
            callback()
        }
    }

    function resetType(elemForm,componentType){
        var typeObj = null;
        var flag = 1;//默认组件有货币/利率/时间
        switch(componentType){
            case 'moneyType':
                typeObj = bt.moneyType;
                break;
            case 'rateType':
                typeObj = bt.rateType;
                break;
            case 'dateType':
                typeObj = bt.dateType;
                break;
            case 'dict':
                typeObj = bt.dicts;
                flag = 3;
                break;
            case 'mulselectType':
                typeObj = bt.mulselect;
                flag = 2;
                break;
            case 'selectTableType'://下拉表格
                typeObj = bt.selectTableType;
                flag = 4;
                break;
            case 'accountTable'://下拉表格
                typeObj = bt.accountTable;
                flag = 4;
                break;

        }
        if(typeObj){ //重置 自定义组件
            if( flag === 4 ){
                var Types = elemForm.find('.bt-biz-'+componentType);
            }else{
                var Types = elemForm.find('.bt-biz-'+componentType+'.init');
            }

            bt.each(Types,function () {
                var $this = $(this);
                if(flag === 1){
                    var value = $this.data('defaultvalue'.toLowerCase())
                    if(value){
                        $this.removeClass("init").val(value);
                        if(componentType !='dateType'){
                            $this.siblings('input[type="hidden"]').remove();
                            if(componentType =='dict' && $this.data('type') =='select'){
                                $this.data('bv',value);//重置bv(beforevalue中)的值
                            }
                        }

                    }else{
                        if(componentType !='dateType'){
                            $this.siblings('input[type="hidden"]').val('');
                            var toUp = $this.data("toUp".toLowerCase());
                            if(toUp){ //如果关联了大写,则清空大写
                                $('#'+toUp).html('');
                            }
                            if(componentType =='dict' && $this.data('type') =='select'){
                                $this.data('bv','');//重置bv(beforevalue中)的值
                            }
                        }else{
                            $this.removeClass("init").val();
                        }
                    }
                }else if( flag === 2){ //多选下拉框
                    $this.removeClass("init").html('') //清空下拉框
                }else if( flag === 3 ){ //dict
                    var dictType = $this.data('type');
                    if( dictType == 'mulselect'){ //多选直接清空
                        $this.find("select").find('option').attr('selected',false);
                        $this.find("dd").removeClass("layui-this").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
                        $this.find('input[type="hidden"]').val('');
                    }
                }else if( componentType == 'selectTableType'){
                    var dvalue = $(this).siblings('input').data('defaultvalue');//默认值
                     $(this).siblings('input').data('beforevalue',dvalue);//更新beforevalue值
                }else if( componentType == 'accountTable' ){
                    $(this).data('beforevalue', $(this).val());//更新beforevalue值
                }
            });

            if( flag === 2 ){
                typeObj.render('reset');
            }else if( flag !== 3 && flag !== 4){
                typeObj.init();//重置
            }
        }
    }
    //判断IE/fireFox浏览器的版本
    function ieVersion() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
        var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
        var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
        var isFirefox = userAgent.indexOf('Firefox') > -1;

        if(isIE) {
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            if(fIEVersion == 7) {
                return 7;
            } else if(fIEVersion == 8) {
                return 8;
            } else if(fIEVersion == 9) {
                return 9;
            } else if(fIEVersion == 10) {
                return 10;
            } else {
                return 6;//IE版本<=7
            }
        } else if(isEdge) {
            return 'edge';//edge
        } else if(isIE11) {
            return 11; //IE11
        }else if(isFirefox){
            return 'Firefox';
        }else{
            return false;//不是ie浏览器
        }
    }

    //解决IE/firefox浏览器 readOnly 输入框光标的问题
    Form.prototype.delInputReadonlyCursor  = function (filter) {
        var that = this;
        var isIe= ieVersion();
        if(isIe){
            //layui2.0 参数 刘勇军
            var elemForm = $(ELEM + function(){
                    return filter ? ('[lay-filter="' + filter +'"]') : '';
                }());
            var readOnlyInputs = elemForm.find(':text[readonly]');
            bt.each(readOnlyInputs,function(i,item){
                if( isIe == 'Firefox'){
                    $(item).attr('onfocus','this.blur()');
                }else{
                    $(item).attr('UNSELECTABLE','on');
                }

            })
        }
    }

    //设置提交按钮自适应位置的方法
    Form.prototype.renderButton  = function (elem) {
        var that = this;
        var h = $(window).height();
        var adaptiveButtons = elem ? $(elem):$('.layui-form-submit-adaptive');
        if(!adaptiveButtons.length){
            return ;
        }
        $.each(adaptiveButtons,function () {
            var elem = $(this);
            elem.css('position','');
            var top = elem.offset().top;
            var submitH =  elem.outerHeight(true);
            if(top +submitH >= h){
                elem.css({
                    'position':'fixed',
                    'border-top': '1px solid #eee',
                    'text-align':'center'
                });
            }else{
                elem.css({
                    'border-top':'none',
                    'text-align':'left'
                });
            }
        })
    }

    /**
     * 回车切换至下一个input text focus
    * */
    Form.prototype.enterToNextInput = function(currentElem){

       if(!currentElem.parents('.layui-form').hasClass('enter-switch')){ //当form表单中没有hasSwitch样式，代表有切换功能
           return '';
       }

        var currentRowNextInputElem = function(td,next){
            var nextTd = td?td.next('td'):next;
            if(nextTd[0]){ //1、当前行有，那就寻找td下面的input；
                var inputElem = nextTd.find('input[type="text"]');
                if(inputElem[0] && inputElem.is(':visible')){
                    setTimeout(function(){
                        $(inputElem[0]).trigger('focus');
                    }, 100);
                    return ''
                }else{ //如果没有可见输入框，继续查询下一个
                    currentRowNextInputElem(nextTd)
                }
            }else{ //如果没有说明是当前行最后一个td
                if(td.parent('tr').next('tr')[0]){ //2、当前行没有，那就寻找下一行；
                    var nextRowFirstTd =  td.parent('tr').next('tr').find('td:eq(0)');
                    currentRowNextInputElem('',nextRowFirstTd)
                }else{
                    return ''
                }
            }
        }

        var currentTd = currentElem.parents('td');
        currentRowNextInputElem(currentTd);
    }

    /**
     * 回车切换至下一个input text focus
     *  在form.enter-switch 容器中，非组件input 设置className标识 input-normal 输入框注册回车事件
     *
     * */

    Form.prototype.normalInputFoucs = function(){
        var that = this;
        $('.enter-switch').on('keydown','input.input-normal',function(event){
            var event=window.event||event;
            if(event.keyCode == 13) {
                that.enterToNextInput($(this));
                return false;
            }
        })
    }

    //自动完成渲染
    var form = new Form(), dom = $(document),win = $(window);
    //测试
    form.render();
    form.addrequiredIcon();
    form.delInputReadonlyCursor();//解决ie/fireFox浏览器只读输入框的有光标的问题
    form.renderButton();//计算按钮固定位置

    form.normalInputFoucs();//给普通输入框注册回车事件

    //表单reset重置渲染
    dom.on('reset',ELEM,function(){
        var that = this;
        var filter = $(this).attr('lay-filter');
        setTimeout(function(){
            form.render(null,filter);
            form.resetComponentType(filter) //重置自定义组件
        }, 50);
    });
    //ie8 组件reset方法
    if(document.querySelector && !window.addEventListener){
        $(ELEM).on("reset",function(){
            var that = this;
            var filter = $(this).attr('lay-filter');
            setTimeout(function(){
                form.render(null,filter);
                form.resetComponentType(filter) //重置自定义组件
            }, 50);
        })
    }
    // 关闭自动补全功能 liuyj 2018-06-07
    $(ELEM).attr('autocomplete','off');
    //表单提交事件
    dom.on('submit', ELEM, submit)
        .on('click', '*[lay-submit]', submit);

    exports(MOD_NAME, function(options){
        return form.set(options);
    });
});