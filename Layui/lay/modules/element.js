/**
 @Name：layui.element 常用元素操作
 @Author：贤心
 @License：MIT

 * liuyj
 * 2017年8月11日
 * 0.0.1 添加选项卡分页功能
 * 0.0.2 新增加initInnerTab方法，为className innerTab的选项卡，添加init标识， 阻止重新加载

 */

layui.define('jquery', function(exports){
    "use strict";

    var $ = layui.jquery
        ,hint = layui.hint()
        ,device = layui.device()

        ,MOD_NAME = 'element', THIS = 'layui-this', SHOW = 'layui-show'

        ,Element = function(){
        this.config = {};
    };

    //全局设置
    Element.prototype.set = function(options){
        var that = this;
        $.extend(true, that.config, options);
        that.initInnerTab();//新增初始化页面中有选择卡方法，为className为innerTab选项卡添加init标识，阻止重新渲染加载页面
        return that;
    };
    // 初始页内有选项 liuyj innerTab
    Element.prototype.initInnerTab = function () {
        var that = this;
        if( $('.layui-tab:not(.layui-tab-card)').find('.layui-tab-content .layui-tab-item').length > 2){ //多个选项卡共同一个内容时，不需要添加innerTab
            //剔除首页导航选项卡部分
            var innerTab = $('.layui-tab:not(.layui-tab-card)').find('.layui-tab-title').find('li.layui-this');
            if(innerTab[0]){
                innerTab.addClass('init');
            }
            $('.layui-tab:not(.layui-tab-card)').find('.layui-tab-title').find('li').addClass('innerTab');
        }
    }

    //表单事件监听
    Element.prototype.on = function(events, callback){
        return layui.onevent(MOD_NAME, events, callback);
    };

    //外部Tab新增
    Element.prototype.tabAdd = function(filter, options){
        var TITLE = '.layui-tab-title'
            ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
            ,titElem = tabElem.children(TITLE)
            ,contElem = tabElem.children('.layui-tab-content');
        //限制tab的数量
        var span = titElem.children('span');
        if(span.length > 0 ){
            var afterSpanLis = span.nextAll('li');
            var maxLiWidth = 168;
            var titileWidth = titElem.outerWidth();
            if(afterSpanLis.length > titileWidth/maxLiWidth){
                layer.msg('任务栏已满，请删除一些', {
                    time: 1000 //1s后自动关闭
                });
                return
            }
        }
        //限制tab数量结束
        titElem.append('<li lay-id="'+ (options.id||'') +'">'+ (options.title||'unnaming') +'</li>');
        contElem.append('<div class="layui-tab-item" data-tab-id="'+ (options.id||'') +'">'+ (options.content||'') +'</div>');
        call.hideTabMore(true);
        call.tabAuto();
        return this;
    };

    //外部Tab删除
    Element.prototype.tabDelete = function(filter, layid){
        var TITLE = '.layui-tab-title'
            ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
            ,titElem = tabElem.children(TITLE)
            ,liElem = titElem.find('>li[lay-id="'+ layid +'"]');
        call.tabDelete(null, liElem);
        return this;
    };

    //外部Tab切换
    Element.prototype.tabChange = function(filter, layid){
        var TITLE = '.layui-tab-title'
            ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
            ,titElem = tabElem.children(TITLE)
            ,liElem = titElem.find('>li[lay-id="'+ layid +'"]');
        call.tabClick(null, null, liElem);
        return this;
    };

    //动态改变进度条
    Element.prototype.progress = function(filter, percent){
        var ELEM = 'layui-progress'
            ,elem = $('.'+ ELEM +'[lay-filter='+ filter +']')
            ,elemBar = elem.find('.'+ ELEM +'-bar')
            ,text = elemBar.find('.'+ ELEM +'-text');
        elemBar.css('width', percent);
        text.text(percent);
        return this;
    };

    var NAV_ELEM = '.layui-nav', NAV_ITEM = 'layui-nav-item', NAV_BAR = 'layui-nav-bar'
        ,NAV_TREE = 'layui-nav-tree', NAV_CHILD = 'layui-nav-child', NAV_MORE = 'layui-nav-more'
        ,NAV_ANIM = 'layui-anim layui-anim-upbit'

        //基础事件体
        ,call = {
            //Tab点击
            tabClick: function(e, index, liElem,isClosed){
                var othis = liElem || $(this)
                    // ,index = index || othis.parent().children('li').index(othis)
                    ,index = othis.parent().children('li').index(othis)
                    ,parents = othis.parents('.layui-tab').eq(0)
                    ,item = parents.children('.layui-tab-content').children('.layui-tab-item')
                    ,filter = parents.attr('lay-filter');

                //根据指定id去操作item内容 liuyj 2014-04-27
                var currentItem;
                var layId = othis.attr('lay-id');
                if( layId && layId.indexOf('card') > -1 ){
                    currentItem = parents.children('.layui-tab-content').children('[data-tab-id ="'+ layId +'"]');
                }else{
                    currentItem =  item.eq(index);
                }

                //解决火狐刷新表格的问题 开始
                var refreshFlag = false;
                if(!othis.hasClass(THIS) && currentItem.data('refresh') =='true'){
                    refreshFlag = true;
                    currentItem.data('refresh','false');
                }
                //结束
                $(parents).find('.'+THIS).addClass('init'); //给当前显示的li添加已经初始始化标识 init

                othis.addClass(THIS).siblings().removeClass(THIS);
                // item.eq(index).addClass(SHOW).siblings().removeClass(SHOW);
                currentItem.addClass(SHOW).siblings().removeClass(SHOW);

                //解决页面内有选项卡datatable表格样式问题
                if(othis.hasClass('innerTab') &&  !othis.hasClass('init')){
                    var iframe  = currentItem.find('iframe')[0];
                    if(iframe){
                        //var fname = iframe.name;
                        ////var iframeDom = top.frames[fname];
                        //var iframeDom = window.frames[fname];//修改为window，解决iframe嵌套选项卡的问题
                        //var lengthMenu = iframeDom.$(".dataTables_wrapper .datatable-page").find('select').val();//获取当前表格的每页显示多少条信息；
                        //if(iframeDom.$.fn.dataTable && lengthMenu ){
                        //    //iframeDom.$.fn.dataTable.tables( { visible: true, api: true} ).page.len( lengthMenu ).draw('page');// 对表格进行重绘，要求页码/每页多少条不变
                        //    //var wid = iframeDom.$(".DTFC_LeftBodyLiner").width();
                        //    //iframeDom.$(".DTFC_LeftBodyLiner").css('width',(wid - 3)+'px!important');
                        //
                        //}else{
                        //    iframe.src =    iframe.src;
                        //}
                        iframe.src =    iframe.src;
                        othis.addClass('init');
                    }

                }else{
                    if(othis.hasClass('innerTab')){
                        othis.addClass('init');
                    }else if(!othis.hasClass('init')){　
                        if(othis.attr('lay-id') && othis.attr('lay-id').indexOf('card') === -1){//对页面内部有选项卡且有datatable进行首次刷新
                            othis.addClass('init');
                            var iframe  = currentItem.find('iframe')[0];
                            if(iframe){
                                iframe.src =    iframe.src;
                            }
                        }

                    }
                }
                //解决google内核，滚动条消失的问题  开始
                var iframe = currentItem.find('iframe')[0];
                if(iframe){
                    iframe.style.height = "99%";
                    iframe.scrollWidth;
                    iframe.style.height = "100%";
                }
                //结束
                //添加tab翻页功能
                var span = $(this).siblings('span');
                if(span.length !== 0 && !isClosed){ //判断是否有两行选项卡菜单
                    var spanTitle = span.attr('title'); //选项卡行是否被展开
                    if( spanTitle ){
                        var height = othis.height();//获取高度
                        var title = othis.parent();//选项卡盒子
                        var parentsTop = title.offset().top;//获取距离顶部的距离
                        //获取第二行选项卡最小的索引
                        var getIndex = function (i)  {
                            var offsetTop = title.find('li:eq('+ i +')').offset().top;//获取指定索引距离顶部的距离
                            if( offsetTop - parentsTop > height -1 ){ //如果该索引的选项卡是在第二行，就继续找
                                i--;
                                return getIndex(i)//递归
                            }else{
                                return i;
                            }
                        }
                        var othisOffestTop = othis.offset().top;//当前选项卡的位置
                        if( othisOffestTop - parentsTop > height -1 ){ //如果是在第二行，就执行下面代码，否则不用查找
                            index --;
                            var lastIndex = getIndex(index);
                            var alllis = title.find('li:eq('+ lastIndex +')').nextAll('li');//获取指定选项卡后面的li元素；
                            var firstli = span.siblings('[lay-id="0"]');
                            firstli.after(alllis);//插入在第一个选项卡之后
                        }
                    }
                }

                layui.event.call(this, MOD_NAME, 'tab('+ filter +')', {
                    elem: parents
                    ,index: index
                });
            }

            //Tab删除
            // liuyj 2018-04-28 单独封装了一个tabDel方法
            ,tabDelete: function(e, othis){
                var li = othis || $(this).parent(), index = li.index();
                var parents = li.parents('.layui-tab').eq(0);
                var item = parents.children('.layui-tab-content').children('.layui-tab-item');
                // var isClosed = true;//标识关闭 放到tabDel方法中去了
                //定位对应的item内容
                var currentItem ;
                var layId = li.attr('lay-id');
                if( layId && layId.indexOf('card') > -1 ){ //根据lay-id去获取指定的item内容
                    currentItem = parents.children('.layui-tab-content').children('[data-tab-id ="'+ layId +'"]');
                }else{
                    currentItem = item.eq(index);
                }
                if( li.attr('upload') == 'true' ){ //解决上传了附件未提交时的提示
                    layer.confirm('上传的附件未保存，是否离开当前页面？', {
                        btn: ['是','否'] //按钮
                    }, function(){
                        tabDel(li,index,currentItem);//单独封装了一个tabDel方法 liuyj 2018-04-28
                    }, function(){
                    });
                }else{
                    tabDel(li,index,currentItem);//单独封装了一个tabDel方法 liuyj 2018-04-28
                }
            }

            //Tab自适应
            ,tabAuto: function(){
                var SCROLL = 'layui-tab-scroll', MORE = 'layui-tab-more', BAR = 'layui-tab-bar'
                    ,CLOSE = 'layui-tab-close', that = this;

                $('.layui-tab').each(function(){
                    var othis = $(this)
                        ,title = othis.children('.layui-tab-title')
                        ,item = othis.children('.layui-tab-content').children('.layui-tab-item')
                        ,STOPE = 'lay-stope="tabmore"'
                        ,span = $('<span class="layui-unselect layui-tab-bar" '+ STOPE +'><i '+ STOPE +' class="layui-icon">&#xe61a;</i></span>');

                    if(that === window && device.ie != 8){
                        call.hideTabMore(true)
                    }

                    //允许关闭
                    if(othis.attr('lay-allowClose')){
                        title.find('li').each(function(){
                            var li = $(this);
                            if(!li.find('.'+CLOSE)[0]){
                                var close = $('<i class="layui-icon layui-unselect '+ CLOSE +'">&#x1006;</i>');
                                close.on('click', call.tabDelete);
                                li.append(close);
                            }
                        });
                    }

                    //响应式
                    // if(title.prop('scrollWidth') > title.outerWidth()+1){
                    //添加tab分页标识page liuyj
                    if(title.prop('scrollWidth') > title.outerWidth()+1 || title.hasClass("page")){
                        if(title.find('.'+BAR)[0]) return;
                        title.find('li:last').before(span)
                        // title.append(span);
                        othis.attr('overflow', '');
                        span.on('click', function(e){
                            title[this.title ? 'removeClass' : 'addClass'](MORE);
                            this.title = this.title ? '' : '收缩';
                        });
                    } else {
                        title.find('.'+BAR).remove();
                        //删除分行标识 liuyj
                        // title.find("br").remove();
                        othis.removeAttr('overflow');
                    }
                });
            }
            //隐藏更多Tab
            ,hideTabMore: function(e){
                var tsbTitle = $('.layui-tab-title');
                if(e === true || $(e.target).attr('lay-stope') !== 'tabmore'){
                    tsbTitle.removeClass('layui-tab-more');
                    tsbTitle.find('.layui-tab-bar').attr('title','');
                }
            }

            //点击选中
            ,clickThis: function(){
                var othis = $(this), parents = othis.parents(NAV_ELEM)
                    ,filter = parents.attr('lay-filter');

                if(othis.find('.'+NAV_CHILD)[0]) return;
                parents.find('.'+THIS).removeClass(THIS);
                othis.addClass(THIS);
                layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
            }
            //点击子菜单选中
            ,clickChild: function(){
                var othis = $(this), parents = othis.parents(NAV_ELEM)
                    ,filter = parents.attr('lay-filter');
                parents.find('.'+THIS).removeClass(THIS);
                othis.addClass(THIS);
                layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
            }
            //展开二级菜单
            ,showChild: function(){
                var othis = $(this), parents = othis.parents(NAV_ELEM);
                var parent = othis.parent(), child = othis.siblings('.'+NAV_CHILD);
                if(parents.hasClass(NAV_TREE)){
                    child.removeClass(NAV_ANIM);
                    parent[child.css('display') === 'none' ? 'addClass': 'removeClass'](NAV_ITEM+'ed');
                }
            }

            //折叠面板
            ,collapse: function(){
                var othis = $(this), icon = othis.find('.layui-colla-icon')
                    ,elemCont = othis.siblings('.layui-colla-content')
                    ,parents = othis.parents('.layui-collapse').eq(0)
                    ,filter = parents.attr('lay-filter')
                    ,isNone = elemCont.css('display') === 'none';
                //是否手风琴
                if(typeof parents.attr('lay-accordion') === 'string'){
                    var show = parents.children('.layui-colla-item').children('.'+SHOW);
                    show.siblings('.layui-colla-title').children('.layui-colla-icon').html('&#xe602;');
                    show.removeClass(SHOW);
                }
                elemCont[isNone ? 'addClass' : 'removeClass'](SHOW);
                icon.html(isNone ? '&#xe61a;' : '&#xe602;');

                layui.event.call(this, MOD_NAME, 'collapse('+ filter +')', {
                    title: othis
                    ,content: elemCont
                    ,show: isNone
                });
            }
        };

    //初始化元素操作
    Element.prototype.init = function(type){
        var that = this, items = {

            //Tab选项卡
            tab: function(){
                call.tabAuto.call({});
            }

            //导航菜单
            ,nav: function(){
                var TIME = 200, timer, timerMore, timeEnd, follow = function(bar, nav){
                    var othis = $(this), child = othis.find('.'+NAV_CHILD);

                    if(nav.hasClass(NAV_TREE)){
                        bar.css({
                            top: othis.position().top
                            ,height: othis.children('a').height()
                            ,opacity: 1
                        });
                    } else {
                        child.addClass(NAV_ANIM);
                        bar.css({
                            left: othis.position().left + parseFloat(othis.css('marginLeft'))
                            ,top: othis.position().top + othis.height() - 5
                        });

                        timer = setTimeout(function(){
                            bar.css({
                                width: othis.width()
                                ,opacity: 1
                            });
                        }, device.ie && device.ie < 10 ? 0 : TIME);

                        clearTimeout(timeEnd);
                        if(child.css('display') === 'block'){
                            clearTimeout(timerMore);
                        }
                        timerMore = setTimeout(function(){
                            child.addClass(SHOW)
                            othis.find('.'+NAV_MORE).addClass(NAV_MORE+'d');
                        }, 300);
                    }
                }

                $(NAV_ELEM).each(function(){
                    var othis = $(this)
                        ,bar = $('<span class="'+ NAV_BAR +'"></span>')
                        ,itemElem = othis.find('.'+NAV_ITEM);

                    //Hover滑动效果
                    if(!othis.find('.'+NAV_BAR)[0]){
                        othis.append(bar);
                        itemElem.on('mouseenter', function(){
                            follow.call(this, bar, othis);
                        }).on('mouseleave', function(){
                            if(!othis.hasClass(NAV_TREE)){
                                clearTimeout(timerMore);
                                timerMore = setTimeout(function(){
                                    othis.find('.'+NAV_CHILD).removeClass(SHOW);
                                    othis.find('.'+NAV_MORE).removeClass(NAV_MORE+'d');
                                }, 300);
                            }
                        });
                        othis.on('mouseleave', function(){
                            clearTimeout(timer)
                            timeEnd = setTimeout(function(){
                                if(othis.hasClass(NAV_TREE)){
                                    bar.css({
                                        height: 0
                                        ,top: bar.position().top + bar.height()/2
                                        ,opacity: 0
                                    });
                                } else {
                                    bar.css({
                                        width: 0
                                        ,left: bar.position().left + bar.width()/2
                                        ,opacity: 0
                                    });
                                }
                            }, TIME);
                        });
                    }

                    itemElem.each(function(){
                        var oitem = $(this), child = oitem.find('.'+NAV_CHILD);

                        //二级菜单
                        if(child[0] && !oitem.find('.'+NAV_MORE)[0]){
                            var one = oitem.children('a');
                            one.append('<span class="'+ NAV_MORE +'"></span>');
                        }
                        //加入点击禁止标志 by zhoul 2017-11-23
                        if(!oitem.parent().hasClass('disabled-click')){
                            oitem.off('click', call.clickThis).on('click', call.clickThis); //点击选中
                        }
                        oitem.children('a').off('click', call.showChild).on('click', call.showChild); //展开二级菜单
                        child.children('dd').off('click', call.clickChild).on('click', call.clickChild); //点击子菜单选中
                    });
                });
            }

            //面包屑
            ,breadcrumb: function(){
                var ELEM = '.layui-breadcrumb';

                $(ELEM).each(function(){
                    var othis = $(this)
                        ,separator = othis.attr('lay-separator') || '>'
                        ,aNode = othis.find('a');
                    if(aNode.find('.layui-box')[0]) return;
                    aNode.each(function(index){
                        if(index === aNode.length - 1) return;
                        $(this).append('<span class="layui-box">'+ separator +'</span>');
                    });
                    othis.css('visibility', 'visible');
                });
            }

            //进度条
            ,progress: function(){
                var ELEM = 'layui-progress';

                $('.'+ELEM).each(function(){
                    var othis = $(this)
                        ,elemBar = othis.find('.layui-progress-bar')
                        ,width = elemBar.attr('lay-percent');
                    elemBar.css('width', width);
                    if(othis.attr('lay-showPercent')){
                        setTimeout(function(){
                            var percent = Math.round(elemBar.width()/othis.width()*100);
                            if(percent > 100) percent = 100;
                            elemBar.html('<span class="'+ ELEM +'-text">'+ percent +'%</span>');
                        },350);
                    }
                });
            }

            //折叠面板
            ,collapse: function(){
                var ELEM = 'layui-collapse';

                $('.'+ELEM).each(function(){
                    var elemItem = $(this).find('.layui-colla-item')
                    elemItem.each(function(){
                        var othis = $(this)
                            ,elemTitle = othis.find('.layui-colla-title')
                            ,elemCont = othis.find('.layui-colla-content')
                            ,isNone = elemCont.css('display') === 'none';

                        //初始状态
                        elemTitle.find('.layui-colla-icon').remove();
                        elemTitle.append('<i class="layui-icon layui-colla-icon">'+ (isNone ? '&#xe602;' : '&#xe61a;') +'</i>');

                        //点击标题
                        elemTitle.off('click', call.collapse).on('click', call.collapse);
                    });

                });
            }
        };

        return layui.each(items, function(index, item){
            item();
        });
    };

    //将tabDelete抽取出来部分，便于复用
    var tabDel = function (li,index,currentItem) {
        var isClosed = true;
        if(li.hasClass(THIS)){
            // if(li.next()[0]){
            //新增加：解决关闭子页面时，回到父页面
            var parentId = li.attr("parentid");
            var liElem = li.parent().find('>li[lay-id="'+ parentId +'"]');
            if(liElem.length){
                call.tabClick(null, null, liElem);
                //新增加结束
            }else{
                if(li.next('li')[0]){
                    call.tabClick.call(li.next()[0], null, index + 1,null,isClosed);
                } else if(li.prev()[0]){
                    if(!li.prev('li')[0]){//当li上一个元素不为li时，即为span时，调整index及elem
                        call.tabClick.call(li.prev().prev()[0], null, index - 2,null,isClosed);
                    }else{
                        call.tabClick.call(li.prev()[0], null, index - 1,null,isClosed);
                    }
                }
            }
        }


        //更新右侧菜单的active样式
        // 1.获取li url值；
        var hrefUrl = li.attr('url');
        // 2.通过href-url在右侧菜单中找到相对应的菜单，remove active
        if(hrefUrl){
            var leftNavItem = $('.bt-nav').find('a[href-url="'+hrefUrl+'"]');
            if(leftNavItem[0]){
                leftNavItem.removeClass('active');
            }
        }
        // item.eq(index).remove();

        li.remove();
        currentItem.remove();
        setTimeout(function(){
            call.tabAuto();
        }, 50);
    }

    var element = new Element(), dom = $(document);
    element.init();

    var TITLE = '.layui-tab-title li';
    dom.on('click', TITLE, call.tabClick); //Tab切换
    dom.on('click', call.hideTabMore); //隐藏展开的Tab
    $(window).on('resize', call.tabAuto); //自适应

    exports(MOD_NAME, function(options){
        return element.set(options);
    });
});
