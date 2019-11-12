; (function (window, document) {
    var MaskShare = function (targetDom, options) {
        // 判断是用函数创建的还是用new创建的。这样我们就可以通过MaskShare("dom") 或 new MaskShare("dom")来使用这个插件了
        if (!(this instanceof MaskShare)) return new MaskShare(targetDom, options);

        // 参数合并
        this.options = this.extend({
            // 这个参数以后可能会更改所以暴露出去
            // imgSrc: "../static/img/coupon-mask_1.png"
        }, options);

        // 判断传进来的是DOM还是字符串
        if ((typeof targetDom) === "string") {
            this.targetDom = document.querySelector(targetDom);
        } else {
            this.targetDom = targetDom;
        }

        var boxDom = document.createElement("div");
        var imgDom = document.createElement("img");

        // 设置默认样式 注意将z-index值设置大一些，防止其他元素层级比遮罩层高
        boxDom.style.cssText = "display: none;position: absolute;left: 0;top: 0;width: 100%;height:100%;background-color: rgba(0,0,0,0.8);z-index:9999;";
        imgDom.style.cssText = "margin-top:20px;width: 100%;";

        // 追加或重设其样式
        if (this.options.boxDomStyle) {
            this.setStyle(boxDom, this.options.boxDomStyle);
        }
        if (this.options.imgDomStyle) {
            this.setStyle(imgDom, this.options.imgDomStyle);
        }

        imgDom.src = this.options.imgSrc;
        boxDom.appendChild(imgDom);
        this.boxDom = boxDom;

        // 初始化
        this.init();
    };
    MaskShare.prototype = {
        init: function () {
            this.event();
        },
        extend: function (obj, obj2) {
            for (var k in obj2) {
                obj[k] = obj2[k];
            }
            return obj;
        },
        setStyle: function (dom, objStyle) {
            for (var k in objStyle) {
                dom.style[k] = objStyle[k];
            }
        },
        event: function () {
            var _this = this;

            this.targetDom.addEventListener("click", function () {
                document.body.appendChild(_this.boxDom);
                _this.boxDom.style.display = "block";
                // 打开遮罩层的回调
                _this.options.open && _this.options.open();
            }, false);

            this.boxDom.addEventListener("click", function () {
                this.style.display = "none";
                // 关闭遮罩层的回调
                _this.options.close && _this.options.close();
            }, false);
        }
    };
    // 暴露方法
    window.MaskShare = MaskShare;
}(window, document));