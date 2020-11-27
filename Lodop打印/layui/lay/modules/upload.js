/** layui-v1.0.9_rls MIT License By http://www.layui.com */
 ;layui.define("layer",function(e){"use strict";var a=layui.jquery,t=layui.layer,i=(layui.device(),"layui-upload-enter"),n="layui-upload-iframe",r={icon:2,shift:6},o={file:bt.lang('common.upload.file'),video:bt.lang('common.upload.video'),audio:bt.lang('common.upload.audio')},s=function(e){this.options=e;if(this.options.elem){if (!a(this.options.elem).attr('title')){a(this.options.elem).attr('title',bt.lang('common.upload.uploadFile'))}}};s.prototype.init=function(){var e=this,t=e.options,r=a("body"),s=a(t.elem||".layui-upload-file"),u=a('<iframe id="'+n+'" class="'+n+'" name="'+n+'"></iframe>');return a("#"+n)[0]||r.append(u),s.each(function(r,s){s=a(s);var u='<form target="'+n+'" method="'+(t.method||"post")+'" key="set-mine" enctype="multipart/form-data" action="'+(t.url||"")+'"></form>',l=s.attr("lay-type")||t.type;t.unwrap||(u='<div class="layui-box layui-upload-button">'+u+'<span class="layui-upload-icon"><i class="layui-icon">&#xe608;</i>'+(s.attr("lay-title")||t.title||bt.lang('common.upload.upload')+(o[l]||bt.lang('table.processDefinitions.image')))+"</span></div>"),u=a(u),t.unwrap||u.on("dragover",function(e){e.preventDefault(),a(this).addClass(i)}).on("dragleave",function(){a(this).removeClass(i)}).on("drop",function(){a(this).removeClass(i)}),s.parent("form").attr("target")===n&&(t.unwrap?s.unwrap():(s.parent().next().remove(),s.unwrap().unwrap())),s.wrap(u),s.off("change").on("change",function(){e.action(this,l)})})},s.prototype.action=function(e,i){var o=this,s=o.options,u=e.value,l=a(e),p=l.attr("lay-ext")||s.ext||"";if(u){switch(i){case"file":if(p&&!RegExp("\\w\\.("+p+")$","i").test(escape(u)))return t.msg(bt.lang('common.upload.fileFormatError'),r),e.value="";break;case"video":if(!RegExp("\\w\\.("+(p||"avi|mp4|wma|rmvb|rm|flash|3gp|flv")+")$","i").test(escape(u)))return t.msg(bt.lang('common.upload.videoFormatError'),r),e.value="";break;case"audio":if(!RegExp("\\w\\.("+(p||"mp3|wav|mid")+")$","i").test(escape(u)))return t.msg(bt.lang('common.upload.audioFormatError'),r),e.value="";break;default:if(!RegExp("\\w\\.("+(p||"jpg|png|gif|bmp|jpeg")+")$","i").test(escape(u)))return t.msg(bt.lang('common.upload.imageFormatError'),r),e.value=""}s.before&&s.before(e),l.parent().submit();var c=a("#"+n),f=setInterval(function(){var a;try{a=c.contents().find("body").text()}catch(i){t.msg(bt.lang('common.upload.uploadApiCross'),r),clearInterval(f)}if(a){clearInterval(f),c.contents().find("body").html("");try{a=JSON.parse(a)}catch(i){return a={},t.msg(bt.lang('common.upload.uploadApiReturnJSON'),r)}"function"==typeof s.success&&s.success(a,e)}},30);e.value=""}},e("upload",function(e){var a=new s(e=e||{});a.init()})});
