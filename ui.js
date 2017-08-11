

AMapUI.weakDefine("ui/misc/PathSimplifier/render/canvas", [ "lib/utils", "lib/dom.utils", "./base", "../lib/PointItem", "../lib/lineHelper", "../lib/PathCursor", "../lib/PointForRender" ], function(utils, domUtils, BaseRender, PointItem, lineHelper, PathCursor, PointForRender) {
    function CanvasRender(simpIns, opts) {
        this._opts = utils.extend({
            styleKeysForCanvas: [ "globalAlpha", "fillStyle", "strokeStyle", "lineJoin", "lineCap", "lineDashOffset", "lineWidth", "miterLimit", "shadowBlur", "shadowColor", "shadowOffsetX", "shadowOffsetY" ]
        }, opts);
        this._opts = utils.nestExtendObjs({}, [ defaultNestedOpts, this._opts ]);
        for (var k in defaultNestedOpts) defaultNestedOpts.hasOwnProperty(k) && utils.isObject(this._opts[k]) && utils.isObject(defaultNestedOpts[k]) && (this._opts[k] = utils.extend({}, defaultNestedOpts[k], this._opts[k]));
        CanvasRender.__super__.constructor.call(this, simpIns, this._opts);
        this._isVisible = !0;
        this.on("hoverDataItemChanged", this._handleHoverDataItemChanged);
        this._pathSegStyleCache = {};
        this._canvasTags = [];
        this._initContainter();
        this._pathCursor = new PathCursor();
        this._loadDeps(this._setupCustomLayer);
    }
    var lineMethodMap = {
        defaultArrow: function(ctx, x, y, width, height) {
            ctx.moveTo(x, y + height);
            ctx.lineTo(x + width / 2, y + height / 2);
            ctx.lineTo(x + width, y + height);
        },
        defaultPathNavigator: function(ctx, x, y, width, height) {
            var halfW = width / 2, topCenter = [ x + halfW, y ], leftBottom = [ x, y + height ], rightBottom = [ x + width, y + height ], arrowBottom = [ x + halfW, y + .75 * height ];
            ctx.moveTo(arrowBottom[0], arrowBottom[1]);
            ctx.lineTo(rightBottom[0], rightBottom[1]);
            ctx.lineTo(topCenter[0], topCenter[1]);
            ctx.lineTo(leftBottom[0], leftBottom[1]);
            ctx.lineTo(arrowBottom[0], arrowBottom[1]);
            ctx.lineTo(topCenter[0], topCenter[1]);
        },
        circle: function(ctx, x, y, width, height) {
            var radius = (width < height ? width : height) / 2, center = [ x + width / 2, y + height / 2 ];
            ctx.moveTo(center[0] + radius, center[1]);
            ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        },
        none: function() {}
    }, defaultNestedOpts = {
        pathLineStyle: {
             lineJoin: "round",
             lineCap: "round",
            fillStyle: null,
            lineWidth: 3,
            strokeStyle: "#F7B538",
            borderWidth: 1,
            borderStyle: "#eeeeee"
        },
        // pathLineHoverStyle: {
        //     inheritFrom: "pathLineStyle",
        //     disableIfSelected: !0,
        //     fillStyle: null,
        //     strokeStyle: "rgba(204, 63, 88,1)",
        //     borderWidth: 1,
        //     borderStyle: "#cccccc"
        // },
        pathLineSelectedStyle: {
            inheritFrom: "pathLineStyle",
            fillStyle: null,
            lineWidth: 6,
            strokeStyle: "#C11534",
            borderWidth: 1,
            borderStyle: "#cccccc",
            // dirArrowStyle: {
            //     strokeStyle: "#ffffff"
            // }
        },
        // keyPointStyle: {
        //     radius: 3,
        //     fillStyle: "rgba(8, 126, 196, 1)",
        //     lineWidth: 1,
        //     strokeStyle: "rgba(238, 238, 238, 1)"
        // },
        keyPointHoverStyle: {
            inheritFrom: "keyPointStyle",
            radius: 5,
            fillStyle: "rgba(8, 126, 196, 0.5)",
            lineWidth: 2,
            strokeStyle: "#ffa500"
        },
        // keyPointOnSelectedPathLineStyle: {
        //     radius: 4,
        //     inheritFrom: "keyPointStyle",
        //     fillStyle: "rgba(8, 126, 196, 1)",
        //     lineWidth: 2,
        //     strokeStyle: "#eeeeee"
        // },
        // startPointStyle: {
        //     radius: 4,
        //     inheritFrom: "keyPointStyle",
        //     fillStyle: "#109618",
        //     strokeStyle: "#eeeeee"
        // },
        // endPointStyle: {
        //     radius: 4,
        //     inheritFrom: "keyPointStyle",
        //     fillStyle: "#dc3912",
        //     strokeStyle: "#eeeeee"
        // },
        dirArrowStyle: {
            lineJoin: "miter",
            lineCap: "round",
            content: "defaultArrow",
            strokeStyle: "#ffffff",
            lineWidth: 2
        },
        pathNavigatorStyle: {
            autoRotate: !0,
            width: 16,
            height: 16,
            lineJoin: "round",
            content: "defaultPathNavigator",
            fillStyle: "#087EC4",
            strokeStyle: "#116394",
            lineWidth: 1,
            pathLinePassedStyle: {
                lineWidth: 2,
                strokeStyle: "rgba(8, 126, 196, 1)"
            }
        },
        hoverTitleStyle: {
            offset: [ 0, 0 ],
            classNames: "",
            position: "left"
        }
    };
    utils.inherit(CanvasRender, BaseRender);
    utils.extend(CanvasRender, {
        getImageContent: function(src, onload, onerror) {
            var image, isLoaded = !1;
            if (utils.isString(src)) {
                image = document.createElement("img");
                image.crossOrigin = "Anonymous";
                image.addEventListener("load", function() {
                    isLoaded = !0;
                    onload && onload.call(this);
                }, !1);
                image.addEventListener("error", function(e) {
                    onerror && onerror.call(this, e);
                }, !1);
                image.src = src;
            } else if (utils.isHTMLElement(src)) {
                image = src;
                isLoaded = !0;
            }

            return function(ctx, x, y, width, height, canvas) {
                isLoaded && ctx.drawImage(image, x-width/4, y-height/4, width, height);
            };
        }
    });
    utils.extend(CanvasRender.prototype, {
        _createCanvas: function(tag, container) {
            var canvas = document.createElement("canvas");
            canvas.className = tag.toLowerCase() + "-canvas";
            this["_" + tag + "Canvas"] = canvas;
            this["_" + tag + "CanvasCxt"] = canvas.getContext("2d");
            container.appendChild(canvas);
            this._canvasTags.push(tag);
        },
        _getCanvas: function(tag) {
            return this["_" + tag + "Canvas"];
            console.log('canvas')
        },
        _getCanvasCxt: function(tag) {
            return this["_" + tag + "CanvasCxt"];
        },
        _setCanvasSizeByTag: function(targetTag, width, height) {
            for (var i = 0, len = this._canvasTags.length; i < len; i++) {
                var tag = this._canvasTags[i];
                if (!targetTag || tag === targetTag) {
                    var canvas = this._getCanvas(tag);
                    this._setCanvasSize(canvas, width, height);
                }
            }
        },
        _initContainter: function() {
            var container = document.createElement("div");
            this._container = container;
            this._createCanvas("base", container);
            this._createCanvas("naviLine", container);
            var overlayContainter = document.createElement("div");
            overlayContainter.className = "overlay-container amap-ui-hide";
            this._overlayContainter = overlayContainter;
            this._createCanvas("overlay", overlayContainter);
            if (this._opts.hoverTitleStyle) {
                this._overlayTitle = document.createElement("div");
                this._overlayTitle.className = "overlay-title " + this._opts.hoverTitleStyle.position + " " + (this._opts.hoverTitleStyle.classNames || "");
                overlayContainter.appendChild(this._overlayTitle);
            }
            container.appendChild(overlayContainter);
            this._createCanvas("naviPoint", container);
        },
        getLayer: function() {
            return this.layer;
        },
        _setupCustomLayer: function() {
            var map = this._ins.getMap();
            map.setDefaultCursor("default");
            this.layer = new AMap.CustomLayer(this._container, {
                visible: this._isVisible,
                zIndex: this._ins.getOption("zIndex"),
                zooms: [ 1, 20 ],
                map: map
            });
            domUtils.addClass(this._container, "amap-ui-pathsimplifier-container");
            var self = this;
            this.layer.render = function() {
                self.refreshViewState();
                self.render();
            };
        },
        _handleHoverDataItemChanged: function(e, hoverItem) {
            if (hoverItem) {
                this._drawHoverItem(hoverItem);
                this._updateOverlayTitle(hoverItem, e.originalEvent.pixel);
                this._showOverlayContainer();
            } else this._hideOverlayContainer();
        },
        _updateOverlayTitle: function(hoverItem, pos) {
            var ele = this._overlayTitle, gotContent = !1;
            if (ele && this._ins._opts.getHoverTitle) {
                var dataItemPack = this._packDataItem(hoverItem), title = this._ins._opts.getHoverTitle.call(this._ins, dataItemPack.pathData, dataItemPack.pathIndex, dataItemPack.pointIndex), posItem = hoverItem instanceof PointItem ? hoverItem : pos;
                if (title) {
                    ele.innerHTML = title;
                    gotContent = !0;
                    var offset = this._opts.hoverTitleStyle.offset;
                    ele.style.left = Math.round(posItem.x + offset[0]) + "px";
                    ele.style.top = Math.round(posItem.y + offset[1]) + "px";
                }
            }
            domUtils.toggleClass(ele, "amap-ui-hide", !gotContent);
        },
        _setCanvasSize: function(canvas, w, h) {
            var pixelRatio = this.getPixelRatio();
            canvas.width = w * pixelRatio;
            canvas.height = h * pixelRatio;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
        },
        _resetCanvas: function(canvas) {
            if (canvas) {
                canvas.width = canvas.width;
                canvas.height = canvas.height;
            }
        },
        getLineMethodByContent: function(content) {
            return content ? utils.isFunction(content) ? content : lineMethodMap[content] || lineMethodMap["none"] : lineMethodMap["none"];
        },
        _drawHoverItem: function(hoverItem) {
            var canvas = this._getCanvas("overlay"), ctx = this._getCanvasCxt("overlay"), gotContent = !1;
            this.ctx = ctx
            if (canvas) {
                this._resetCanvas(canvas);
                switch (this._getDataItemType(hoverItem)) {
                  case "path":
                    this._drawHoverPathSeg(ctx, hoverItem);
                    break;

                  case "point":
                    this._drawHoverPoint(ctx, hoverItem);
                }
                gotContent = !0;
            }
            domUtils.toggleClass(canvas, "amap-ui-hide", !gotContent);
        },
        _drawHoverPathSeg: function(ctx, pathSeg) {
            var isSelected = this._isPathSegSelected(pathSeg), styleOptions = this._getPathSegStyle("pathLineHoverStyle", pathSeg);
            if (!(!styleOptions || isSelected && styleOptions.disableIfSelected)) {
                this._renderSegLines(pathSeg, ctx, styleOptions);
                styleOptions = this._getPathSegStyle(isSelected ? "keyPointOnSelectedPathLineStyle" : "keyPointStyle", pathSeg);
                styleOptions && this._renderSegKeyPoints(pathSeg, ctx, styleOptions);
            }
        },
        _drawHoverPoint: function(ctx, pointItem) {
            var pathSeg = this._getPathSegByPointIdx(pointItem.idx);
            this._drawHoverPathSeg(ctx, pathSeg);
            var styleOptions = this._getPathSegStyle("keyPointHoverStyle", pathSeg);
            this.drawKeyPoints(ctx, [ pointItem ], styleOptions);
        },
        _hideOverlayContainer: function() {
            domUtils.addClass(this._overlayContainter, "amap-ui-hide");
        },
        _showOverlayContainer: function() {
            domUtils.removeClass(this._overlayContainter, "amap-ui-hide");
        },
        _loadDeps: function(callback) {
            var self = this;
            AMap.plugin([ "AMap.CustomLayer" ], function() {
                self._isReady = !0;
                callback && callback.call(self);
                self.emit("ready");
            });
        },
        onReady: function(fn, thisArg) {
            var finalCall = function() {
                fn.call(thisArg);
            };
            this._isReady ? setTimeout(finalCall, 0) : this.once("ready", finalCall);
        },
        render: function() {
            if (!this._isReady || this.isHidden() === !0) return !1;
            var map = this._ins.getMap(), size = map.getSize();
            this._pathSegStyleCache = {};
            this._setCanvasSizeByTag(null, size.width, size.height);
            this.setHoverDataItem(null);
            this._hideOverlayContainer();
            CanvasRender.__super__.render.apply(this, arguments);
        },
        _getPathSegStyle: function(key, pathSeg, noCache) {
            var pathStyleOpts = this._opts;
            if (utils.isFunction(this._opts.getPathStyle)) {
                var cacheKey = pathSeg.idx + "_" + this._currentZoom;
                if (!noCache && this._pathSegStyleCache[cacheKey]) pathStyleOpts = this._pathSegStyleCache[cacheKey]; else {
                    var tmpOpts = this._opts.getPathStyle.call(this, this._packDataItem(pathSeg), this._currentZoom);
                    if (utils.isObject(tmpOpts)) {
                        pathStyleOpts = utils.nestExtendObjs({}, [ this._opts, tmpOpts ]);
                        noCache || (this._pathSegStyleCache[cacheKey] = pathStyleOpts);
                    }
                }
            }
            if (!pathStyleOpts) return null;
            var styleOptions = pathStyleOpts[key];
            if (!styleOptions) return null;
            styleOptions.inheritFrom && styleOptions !== styleOptions.inheritFrom && (styleOptions = utils.nestExtendObjs({}, [ pathStyleOpts[styleOptions.inheritFrom], styleOptions ]));
            return styleOptions;
        },
        getPointRadius: function(pathSeg) {
            var keyPointStyle = this._getPathSegStyle("keyPointStyle", pathSeg);
            return keyPointStyle ? keyPointStyle.radius : 0;
        },
        getPathLineWidth: function(pathSeg) {
            var pathLineStyle = this._getPathSegStyle(this._isPathSegSelected(pathSeg) ? "pathLineSelectedStyle" : "pathLineStyle", pathSeg);
            return pathLineStyle ? pathLineStyle.lineWidth + (pathLineStyle.borderWidth ? 2 * pathLineStyle.borderWidth : 0) : 0;
        },
        renderPathSegments: function(pathSegs, viewBounds, scaleFactor) {
            var styleOptions, i, lineCtx = this._getCanvasCxt("base"), pointCtx = lineCtx, selectedPathIndex = this.getSelectedPathIndex(), isSelected = !1, len = pathSegs.length;
            pathSegs.sort(this._opts.comparePathSeg);
            for (i = len - 1; i >= 0; i--) {
                isSelected = selectedPathIndex === pathSegs[i].idx;
                styleOptions = this._getPathSegStyle(isSelected ? "pathLineSelectedStyle" : "pathLineStyle", pathSegs[i]);
                styleOptions && this._renderSegLines(pathSegs[i], lineCtx, styleOptions);
                styleOptions = this._getPathSegStyle(isSelected ? "keyPointOnSelectedPathLineStyle" : "keyPointStyle", pathSegs[i]);
                styleOptions && this._renderSegKeyPoints(pathSegs[i], pointCtx, styleOptions);
            }
        },
        _renderSegLines: function(pathSeg, ctx, styleOptions) {
            this._drawSegLines(ctx, pathSeg.segs, styleOptions);
        },
        _renderSegKeyPoints: function(pathSeg, ctx, styleOptions) {
            this._drawSegKeyPoints(ctx, pathSeg.segs, styleOptions);
            this._drawSegStartEndPoints(ctx, pathSeg.segs, this._getPathSegStyle("startPointStyle", pathSeg), this._getPathSegStyle("endPointStyle", pathSeg));
        },
        _linePath: function(ctx, points, styleOptions, pixelRatio) {
            if (!(points.length < 2)) {
                ctx.moveTo(points[0].x * pixelRatio, points[0].y * pixelRatio);
                for (var i = 1, len = points.length; i < len; i++) ctx.lineTo(points[i].x * pixelRatio, points[i].y * pixelRatio);
            }
        },
        _drawSegLines: function(ctx, segs, styleOptions) {
            for (var pathList = [], i = 0, len = segs.length; i < len; i++){
                pathList.push(segs[i].pathPoints);
            }
            this.drawPathLines(ctx, pathList, styleOptions);
        },
        
        _fillAndStroke: function(ctx, styleOptions) {
            for (var styleKeys = this._opts.styleKeysForCanvas, i = 0, len = styleKeys.length; i < len; i++) {
                var skey = styleKeys[i];
                styleOptions[skey] && (ctx[skey] = styleOptions[skey]);
            }
            styleOptions.fillStyle && ctx.fill();
            //中间的线的样式
            // if (styleOptions.borderStyle && styleOptions.borderWidth || 0 === styleOptions.borderWidth) {
            //     ctx.strokeStyle = 'red';
            //     ctx.lineWidth = (styleOptions.lineWidth + 2 * styleOptions.borderWidth) * this._currentPixelRatio;
            //     ctx.stroke();
            // }
            //主线的颜色
            if (styleOptions.strokeStyle && styleOptions.lineWidth) {
                // ctx.strokeStyle = 'yellow';
                ctx.strokeStyle = styleOptions.strokeStyle;
                styleOptions.lineWidth && (ctx.lineWidth = styleOptions.lineWidth * this._currentPixelRatio);
                styleOptions.strokeDashArray && ctx.setLineDash && ctx.setLineDash(styleOptions.strokeDashArray);
                ctx.stroke();
            }
            styleOptions.styleOptions && this._fillAndStroke(ctx, styleOptions.styleOptions);
        },
        _drawLineArrows: function(ctx, pathList, styleOptions) {
            if (styleOptions) {
                ctx.save();
                ctx.beginPath();
                for (var lineMethod = this.getLineMethodByContent(styleOptions.content), i = 0, len = pathList.length; i < len; i++) this._lineArrowheads(ctx, styleOptions, pathList[i], lineMethod, this._currentPixelRatio);
                this._fillAndStroke(ctx, styleOptions);
                ctx.restore();
            }
        },
        _lineArrowheads: function(ctx, styleOptions, points, lineMethod, pixelRatio) {
            var pathCursor = this._pathCursor;
            pathCursor.setPath(points);
            var count = 0, stepSpace = styleOptions.stepSpace;
            stepSpace || (stepSpace = 6 * styleOptions.width);
            stepSpace = Math.max(1, stepSpace);
            if (!isNaN(stepSpace)) {
                stepSpace = Math.round(stepSpace);
                for (;pathCursor.stepCursorByDistance(stepSpace) && !pathCursor.isCursorAtPathEnd(); ) {
                    count++;
                    if (count > 5e3) {
                        console.error("PathCursor of lineArrow step with " + stepSpace + ", too many dirArrows?");
                        break;
                    }
                    var pos = pathCursor.getPointItemAtCursorDot();
                    pos && this._lineRotate(ctx, pos, pathCursor.getCursorAngleRadians(), styleOptions, pixelRatio, lineMethod);
                }
            }
        },
        _lineRotate: function(ctx, point, radians, styleOptions, pixelRatio, lineMethod) {
            var x = point.x * pixelRatio, y = point.y * pixelRatio;
            ctx.translate(x, y);
            ctx.rotate(radians);
            var lineWidth = styleOptions.lineWidth || 2, w = styleOptions.width * pixelRatio - lineWidth * pixelRatio, h = (styleOptions.height || styleOptions.width) * pixelRatio - lineWidth * pixelRatio;
            lineMethod.call(this, ctx, -w / 2, -h / 2, w, h);
            ctx.rotate(-radians);
            ctx.translate(-x, -y);
        },
        _linePoints: function(ctx, list, styleOptions, pixelRatio) {
            for (var radius = styleOptions.radius, i = 0, len = list.length; i < len; i++) {
                var x = list[i].x, y = list[i].y;
                ctx.moveTo(x * pixelRatio + radius * pixelRatio, y * pixelRatio);
                ctx.arc(x * pixelRatio, y * pixelRatio, radius * pixelRatio, 0, 2 * Math.PI);
            }
        },
        _drawSegKeyPoints: function(ctx, segs, styleOptions) {
            for (var points = [], i = 0, len = segs.length; i < len; i++) points.push.apply(points, segs[i].keyPoints);
            this.drawKeyPoints(ctx, points, styleOptions);
        },
        _drawSegStartEndPoints: function(ctx, segs, startPointStyleOptions, endPointStyleOptions) {
            for (var startPoint = null, endPoint = null, i = 0, len = segs.length; i < len; i++) {
                segs[i].pathStartPoint && (startPoint = segs[i].pathStartPoint);
                segs[i].pathEndPoint && (endPoint = segs[i].pathEndPoint);
            }
            startPoint && startPointStyleOptions && this.drawKeyPoints(ctx, [ startPoint ], startPointStyleOptions);
            endPoint && endPointStyleOptions && this.drawKeyPoints(ctx, [ endPoint ], endPointStyleOptions);
        },
        _renderPassedSegs: function(ctx, pathSeg, range, styleOptions) {
            if (range) {
                var segs = pathSeg.getPathSegsByPointIdxRange(range.minIdx, range.maxIdx);
                if (!segs.length) {
                    var segItem = pathSeg.getEmptySegItemForRender();
                    segItem.pathPoints = [];
                    segs = [ segItem ];
                }
                range.startPoint && segs[0].pathPoints.unshift(range.startPoint);
                range.endPoint && segs[segs.length - 1].pathPoints.push(range.endPoint);
                this._drawSegLines(ctx, segs, styleOptions);
            }
        },
        renderPathNavigators: function(pathNavigators, viewBounds, scaleFactor) {
            if (this.isHidden() !== !0) {
                this._resetCanvas(this._getCanvas("naviLine"));
                this._resetCanvas(this._getCanvas("naviPoint"));
                for (var pointCtx = this._getCanvasCxt("naviPoint"), lineCtx = this._getCanvasCxt("naviLine"), i = 0, len = pathNavigators.length; i < len; i++) {
                    var navigr = pathNavigators[i], pathSeg = this._getPathSegByPathIndex(navigr.getPathIndex());
                    if (pathSeg) {
                        var styleOptions = utils.nestExtendObjs({}, [ this._getPathSegStyle("pathNavigatorStyle", pathSeg), navigr.getStyleOptions() ]);
                        if (styleOptions.pathLinePassedStyle) {
                            var range = navigr.getPassedPathRange();
                            if (range) {
                                range.startPoint = PointForRender.translate(range.startPoint, viewBounds, scaleFactor);
                                range.endPoint = PointForRender.translate(range.endPoint, viewBounds, scaleFactor);
                                this._renderPassedSegs(lineCtx, pathSeg, range, utils.extendObjs({}, [ this._getPathSegStyle(this._isPathSegSelected(pathSeg) ? "pathLineSelectedStyle" : "pathLineStyle", pathSeg), styleOptions.pathLinePassedStyle ]));
                            }
                        }
                        var point = navigr.getPointItemAtCursorDot();
                        if (point && viewBounds.containPoint(point)) {
                            point = PointForRender.translate(point, viewBounds, scaleFactor);
                            this.drawNavigator(pointCtx, point, styleOptions.autoRotate ? navigr.getCursorAngleRadians() : 0, styleOptions);
                        }
                    }
                }
            }
        },
        drawPathLines: function(ctx, pathList, styleOptions) {
            ctx.save();
            ctx.beginPath();
            for (var i = 0, len = pathList.length; i < len; i++) this._linePath(ctx, pathList[i], styleOptions, this._currentPixelRatio);
            this._fillAndStroke(ctx, styleOptions);
            ctx.restore();
            if (styleOptions.dirArrowStyle) {
                var dirArrowStyle = utils.extendObjs({}, [ this._opts.dirArrowStyle, styleOptions.dirArrowStyle ]);
                dirArrowStyle.width || (dirArrowStyle.width = styleOptions.lineWidth);
                dirArrowStyle.width >= 4 && this._drawLineArrows(ctx, pathList, dirArrowStyle);
            }

        },
        drawKeyPoints: function(ctx, points, styleOptions) {
            if (points.length) {
                ctx.save();
                ctx.beginPath();
                this._linePoints(ctx, points, styleOptions, this._currentPixelRatio);
                this._fillAndStroke(ctx, styleOptions);
                ctx.restore();
            }
        },
        drawNavigator: function(ctx, point, radians, styleOptions) {
            ctx.save();
            var lineMethod = this.getLineMethodByContent(styleOptions.content);
            ctx.beginPath();
            this._lineRotate(ctx, point, radians, styleOptions, this._currentPixelRatio, lineMethod);
            this._fillAndStroke(ctx, styleOptions);
            ctx.restore();
        },
        setOption: function(k, v) {
            utils.isObject(defaultNestedOpts[k]) && utils.isObject(v) && (v = utils.nestExtendObjs({}, [ defaultNestedOpts[k], v ]));
            CanvasRender.__super__.setOption.call(this, k, v);
        },
        isHidden: function() {
            return this.layer ? !this.layer.get("visible") : this._isVisible;
        },
        show: function() {
            if (this.isHidden()) {
                this._isVisible = !0;
                if (this.layer) {
                    this.layer.show();
                    this.layer.render();
                }
                return !0;
            }
        },
        hide: function() {
            if (!this.isHidden()) {
                this._isVisible = !1;
                this.layer && this.layer.hide();
                this.setHoverDataItem(null);
                this._hideOverlayContainer();
                return !0;
            }
        }
    });
    return CanvasRender;
});

AMapUI.weakDefine("ui/misc/PathSimplifier/lib/reqAnim", [], function() {
    window.requestAnimationFrame || !function() {
        for (var lastTime = 0, vendors = [ "ms", "moz", "webkit", "o" ], x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
            window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
        }
        window.requestAnimationFrame || (window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime(), timeToCall = Math.max(0, 16 - (currTime - lastTime)), id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        });
        window.cancelAnimationFrame || (window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        });
    }();
    return {
        requestAnimationFrame: window.requestAnimationFrame,
        cancelAnimationFrame: window.cancelAnimationFrame
    };
});

AMapUI.weakDefine("ui/misc/PathSimplifier/lib/AnimMgr", [ "lib/utils", "lib/event", "./reqAnim" ], function(utils, EventCls, reqAnim) {
    function compareAnimItem(a, b) {
        var diff = a.priority - b.priority;
        return diff ? -diff : a.id - b.id;
    }
    function AnimMgr() {
        AnimMgr.__super__.constructor.apply(this, arguments);
        this.animList = [];
        this.animReqId = null;
        this.baseId = 1;
        var self = this;
        this._selfHandleAnimList = function() {
            self._handleAnimList.apply(self, arguments);
        };
    }
    var requestAnimationFrame = reqAnim.requestAnimationFrame, cancelAnimationFrame = reqAnim.cancelAnimationFrame;
    utils.inherit(AnimMgr, EventCls);
    utils.extend(AnimMgr.prototype, {
        _handleAnimList: function() {
            this.animReqId = null;
            var animList = this.animList, i = 0, len = animList.length, animCount = 0;
            if (len) {
                for (var args = Array.prototype.slice.call(arguments, 0), list = [].concat(animList); i < len; i++) list[i].callback.apply(null, args) !== !1 && animCount++;
                list.length = 0;
                list = null;
            }
            this.triggerAnimAction(animCount);
            this._startHandleAnimList();
        },
        triggerAnimAction: function(count) {
            this.emit("didAnim", count);
        },
        triggerAnimActionLater: function(delay, count) {
            if (!this._triggerAnimTimeId) {
                var self = this;
                this._triggerAnimTimeId = setTimeout(function() {
                    self._triggerAnimTimeId = null;
                    self.triggerAnimAction(count || 1);
                }, delay || 10);
            }
        },
        _startHandleAnimList: function() {
            if (!this.animReqId) {
                var animList = this.animList;
                animList.length && (this.animReqId = requestAnimationFrame(this._selfHandleAnimList));
            }
        },
        clear: function() {
            this.animList.length = 0;
            if (this.animReqId) {
                cancelAnimationFrame(this.animReqId);
                this.animReqId = null;
            }
        },
        addToAnimList: function(callback, priority) {
            var item = {
                id: this.baseId++,
                priority: priority ? priority : 0,
                callback: callback
            }, animList = this.animList;
            animList.push(item);
            animList.sort(compareAnimItem);
            this._startHandleAnimList();
            return item.id;
        },
        removeFromAnimList: function(id) {
            for (var animList = this.animList, i = 0, len = animList.length; i < len; i++) if (animList[i].id === id) {
                animList.splice(i, 1);
                return !0;
            }
            return !1;
        }
    });
    return AnimMgr;
});

AMapUI.weakDefine("ui/misc/PathSimplifier/lib/PathNavigator", [ "lib/utils", "./PathCursor" ], function(utils, PathCursor) {
    function PathNavigator(pathRecord, animMgr, opts) {
        this.pathRecord = pathRecord;
        PathNavigator.__super__.constructor.call(this, pathRecord.points);
        this._animMgr = animMgr;
        this._opts = utils.extend({
            loop: !1,
            animInterval: 16,
            speed: 1e3,
            dirToPosInMillsecs: 200,
            priority: 10
        }, opts);
        this._opts.range && this.setRange.apply(this, this._opts.range);
        this._naviStatus = "stop";
        this._accumedTimespan = 0;
        this._lastAnimTime = 0;
        this._animStep = utils.bind(this._animStep, this);
    }
    utils.inherit(PathNavigator, PathCursor);
    utils.extend(PathNavigator.prototype, {
        _animStep: function(time) {
            if (this._lastAnimTime) {
                var timespan = time - this._lastAnimTime;
                this._lastAnimTime = time;
                this._accumedTimespan += timespan;
                if (this._accumedTimespan < this._opts.animInterval) return !1;
            } else this._lastAnimTime = time;
            this._clearAccumTimespan();
            return !0;
        },
        getNaviStatus: function() {
            return this._naviStatus;
        },
        getPathIndex: function() {
            return this.pathRecord.pathIndex;
        },
        getStyleOptions: function() {
            return this._opts.pathNavigatorStyle;
        },
        getOption: function(k) {
            return this._opts[k];
        },
        setOption: function(k, v) {
            this._opts[k] = v;
        },
        setOptions: function(opts) {
            for (var k in opts) opts.hasOwnProperty(k) && this.setOption(k, opts[k]);
        },
        getPosition: function() {
            var pos = this.getPointItemAtCursorDot();
            return pos ? this._opts.pixelToLngLat(pos.x, pos.y) : null;
        },
        destroy: function() {
            this.stop();
            PathNavigator.__super__.destroy.apply(this, arguments);
        },
        getSpeed: function() {
            return this._opts.speed;
        },
        start: function(idx, speed) {
            idx = idx || this.idxRange[0];
            var roundIdx = Math.floor(idx), tail = Math.abs(idx - roundIdx);
            idx = roundIdx;
            this.resetMovedDistance();
            this.setCursor(idx, tail);
            this._startPosDot = this.cursor.clone();
            speed > 0 && this.setSpeed(speed);
            this._startAnim();
            this._naviStatus = "moving";
            this.trigger("start");

        },
        stop: function() {
            this._stopAnim();
            this._startPosDot = this.cursor.clone();
            this._naviStatus = "stop";
            this.trigger("stop");
            this.resetMovedDistance();
            // console.log('stop')
            // console.log(runPathIndex)
            runPathIndex++
            // console.log(runPathIndex)
            //判断是否到达每一公里
            if(runPathIndex == dotCounts[jungePauseTime]){
                //添加运动表情
                var smile_canvas = pathSimplifierIns.createPathNavigator(runPathIndex, {
                    loop: false,
                    speed: runPath[runPathIndex].speed,
                    pathNavigatorStyle: {
                        width: 100,
                        height: 100,
                        //使用图片
                        content: smile,
                        strokeStyle: null,
                        fillStyle: null,
                        // 经过路径的样式
                        pathLinePassedStyle: {
                            lineWidth: 0,
                            strokeStyle: 'rgba(0,0,0,0)',
                            dirArrowStyle: {
                                stepSpace: 15,
                                strokeStyle: 'rgba(0,0,0,0)'
                            }
                        }
                    }
                });
                topBar.innerHTML = '第'+(jungePauseTime+1)+'公里';
                document.getElementsByTagName('body')[0].appendChild(topBar)
                console.log(this)
                //3秒以后删除
                setTimeout(function(){
                    document.getElementsByTagName('body')[0].removeChild(topBar)
                    PathNavigator.__super__.destroy.apply(smile_canvas, arguments);
                    console.log('timeout')
                    //zyj 当下个要运动的路径不存在时，又将路径从0开始
                    if(runPathIndex>runPath.length-1){
                        // runPathIndex = 0
                        // jungePauseTime = 0
                        console.log('return false')
                        return false
                    }
                    arr[runPathIndex] = pathSimplifierIns.createPathNavigator(runPathIndex, {
                        loop: false,
                        speed: runPath[runPathIndex].speed,
                        pathNavigatorStyle: {
                            width: 100,
                            height: 100,
                            //使用图片
                            content: content,
                            strokeStyle: null,
                            fillStyle: null,
                            // 经过路径的样式
                            pathLinePassedStyle: {
                                lineWidth: 0,
                                strokeStyle: 'rgba(0,0,0,0)',
                                dirArrowStyle: {
                                    stepSpace: 15,
                                    strokeStyle: 'rgba(0,0,0,0)'
                                }
                            }
                        }
                    });
                    arr[runPathIndex].start()
                    jungePauseTime++
                },3000)
                
            }else{
                //zyj 当下个要运动的路径不存在时，又将路径从0开始
                    if(runPathIndex>runPath.length-1){
                        // runPathIndex = 0
                        // jungePauseTime = 0
                        console.log('return false')
                        return false
                    }
                    arr[runPathIndex] = pathSimplifierIns.createPathNavigator(runPathIndex, {
                        loop: false,
                        speed: runPath[runPathIndex].speed,
                        pathNavigatorStyle: {
                            width: 100,
                            height: 100,
                            //使用图片
                            content: content,
                            strokeStyle: null,
                            fillStyle: null,
                            // 经过路径的样式
                            pathLinePassedStyle: {
                                lineWidth: 0,
                                strokeStyle: 'rgba(0,0,0,0)',
                                dirArrowStyle: {
                                    stepSpace: 15,
                                    strokeStyle: 'rgba(0,0,0,0)'
                                }
                            }
                        }
                    });
                    arr[runPathIndex].start()
            }



            
        },
        pause: function(runName) {
            this._stopAnim();
            this._naviStatus = "pause";
            this.trigger("pause");
            //zyj 循环播放时
            // this.destroy()
            //zyj 循环播放时

            //不循环播放时
            if(runPathIndex>runPath.length-2){
                // runPathIndex = 0
                // jungePauseTime = 0
                console.log('return false')
                return false
            }else{
                // console.log(runPathIndex)
                this.destroy();
            }
            //不循环播放时
        },
        resume: function() {
            this._startAnim();
            this._naviStatus = "moving";
            this.trigger("resume");
        },
        getPassedPathRange: function() {
            if (!this._startPosDot || !this.cursor) return null;
            var startIdx = this._startPosDot.idx, startTail = this._startPosDot.tail, currIdx = this.cursor.idx, currTail = this.cursor.tail, start = null, range = null, end = null;
            if (startTail > 0) {
                start = this.getPointItemAt(startIdx, startTail);
                startIdx++;
            }
            range = [ this.getPointItemAt(startIdx), this.getPointItemAt(currIdx) ];
            currTail > 0 && (end = this.getPointItemAt(currIdx, currTail));
            return {
                startPoint: start,
                minIdx: range[0].idx,
                maxIdx: range[1].idx,
                endPoint: end
            };
        },
        setSpeed: function(speed) {
            this._opts.speed = speed;
        },
        _calcDistanceOfTimespan: function(timeSpan) {
            return this._opts.speed * timeSpan / 3600;
        },
        getCursorAngleRadians: function() {
            return PathNavigator.__super__.getCursorAngleRadians.call(this, this._calcDistanceOfTimespan(this._opts.dirToPosInMillsecs));
        },
        getDistanceOfSegment: function(i) {
            return this.pathRecord.getDistanceOfLngLatSegment(i);
        },
        _clearAccumTimespan: function() {
            if (!this._accumedTimespan) return !1;
            var timespan = this._accumedTimespan;
            this._accumedTimespan = 0;
            var result = this._stepByTimespan(timespan);
            return result;
        },
        _stepByTimespan: function(timeSpan) {
            var result = this.moveByDistance(this._calcDistanceOfTimespan(timeSpan));
            this.isCursorAtPathEnd() && (this._opts.loop ? this.start() : this.pause());
            return result;
        },
        moveByDistance: function(distance) {
            var result = this.stepCursorByDistance(distance);
            result && this.listenerLength("move") && this.trigger("move");
            return result;
        },
        moveToPoint: function(idx, tail) {
            var result = this.moveCursorTo(idx, tail);
            result && this.listenerLength("move") && this.trigger("move");
            return result;
        },
        isMoving: function() {
            return !(!this.cursor || !this._animId);
        },
        _stopAnim: function() {
            if (this._animId) {
                this._animMgr.removeFromAnimList(this._animId);
                this._animId = null;
                this._clearAccumTimespan();
                this._lastAnimTime = 0;
            }
            this._animMgr.triggerAnimActionLater(50);
        },
        _startAnim: function() {
            !this._animId && this.path && (this._animId = this._animMgr.addToAnimList(this._animStep, this._opts.priority));
        }
    });
    return PathNavigator;
});

AMapUI.weakDefine("ui/misc/PathSimplifier/lib/PathDataRecord", [ "lib/utils", "./BoundsItem", "./PointItem", "lib/SphericalMercator" ], function(utils, BoundsItem, PointItem, SphericalMercator) {
    function PathDataRecord(pathIndex, startIdx) {
        this.pathIndex = pathIndex;
        this.startIdx = startIdx;
        this.zIndex = 100;
        this.lngLatDists = [];
    }
    utils.extend(PathDataRecord.prototype, {
        setZIndex: function(z) {
            this.zIndex = z;
        },
        getDistanceOfLngLatSegment: function(i) {
            var distCache = this.lngLatDists;
            if (distCache[i] >= 0) return distCache[i];
            var l1 = this.lnglats[i], l2 = this.lnglats[i + 1];
            if (!l1 || !l2) return 0;
            l1.getLng && (l1 = [ l1.getLng(), l1.getLat() ]);
            l2.getLng && (l2 = [ l2.getLng(), l2.getLat() ]);
            distCache[i] = SphericalMercator.haversineDistance(l1, l2);
            return distCache[i];
        },
        buildPath: function(path, lngLatToPixel, opts) {
            for (var points = [], bounds = BoundsItem.getBoundsItemToExpand(), i = 0, len = path.length; i < len; i++) {
                var lnglat = path[i], px = lngLatToPixel(lnglat), item = new PointItem(px[0], px[1], i + this.startIdx);
                points[i] = item;
                bounds.expandByPoint(px[0], px[1]);
            }
            this.length = points.length;
            this.points = points;
            this.lnglats = path;
            this.bounds = bounds;
            this.boundsGroup = this._buildBoundsGroup(points, bounds, opts);
        },
        _buildBoundsGroup: function(points, wholeBounds, opts) {
            var totalLen = points.length, maxSize = opts.maxLengthOfBoundsGroup, minPointsNum = opts.minPointsNumOfBoundsGroup;
            if (wholeBounds.width < maxSize && wholeBounds.height < maxSize) return [ [ 0, totalLen - 1, wholeBounds ] ];
            for (var groups = [], startIdx = 0, tmpBounds = BoundsItem.getBoundsItemToExpand(), i = 0; i < totalLen; i++) {
                tmpBounds.expandByPoint(points[i].x, points[i].y);
                if (i - startIdx + 1 >= minPointsNum && (tmpBounds.width > maxSize || tmpBounds.height > maxSize)) {
                    for (;i < totalLen - 1 && BoundsItem.boundsContainPoint(tmpBounds, points[i + 1]); ) i++;
                    groups.push([ startIdx, i, tmpBounds ]);
                    startIdx = i;
                    tmpBounds = BoundsItem.getBoundsItemToExpand();
                    tmpBounds.expandByPoint(points[i].x, points[i].y);
                }
            }
            startIdx < totalLen - 1 && groups.push([ startIdx, totalLen - 1, tmpBounds ]);
            return groups;
        }
    });
    return PathDataRecord;
});

AMapUI.weakDefine("polyfill/require/require-css/css!ui/misc/PathSimplifier/assets/canvas", [], function() {});

AMapUI.weakDefine("ui/misc/PathSimplifier/main", [ "lib/utils", "lib/dom.utils", "lib/event", "lib/SphericalMercator", "./lib/kdbush/kdbush", "./lib/BoundsItem", "./lib/PointItem", "./render/base", "./render/canvas", "./lib/AnimMgr", "./lib/PathNavigator", "./lib/PathDataRecord", "css!./assets/canvas" ], function(utils, domUtils, EventCls, SphericalMercator, KDBush, BoundsItem, PointItem, BaseRender, CanvasRender, AnimMgr, PathNavigator, PathDataRecord) {
    function PathSimplifier(opts) {
        this._opts = utils.extend({
            zIndex: 200,
            zooms: [ 3, 20 ],
            getPath: function(pathData, idx) {
                throw new Error("getPath has not been implemented!");
            },
            getZIndex: function(pathData, idx) {
                return 100;
            },
            getHoverTitle: function(pathData, idx, pointIndex) {
                // return pointIndex >= 0 ? "Path: " + idx + ", Point:" + pointIndex : "Path: " + idx;
            },
            clickToSelectPath: !0,
            onTopWhenSelected: !0,
            autoSetFitView: !0,
            maxLengthOfBoundsGroup: 16384,
            minPointsNumOfBoundsGroup: 100,
            renderConstructor: CanvasRender,
            renderOptions: null
        }, opts);
        PathSimplifier.__super__.constructor.call(this, this._opts);
        this._maxZoom = this.getMaxZoom();
        this._selectedPathIndex = -1;
        this._animMgr = new AnimMgr();
        this._pathNavgators = [];
        this._opts.clickToSelectPath && this.on("pathClick pointClick", this._handleClickToSelect);
        var RenderConstructor = this._opts.renderConstructor;
        this.renderEngine = new RenderConstructor(this, this._opts.renderOptions);
        var self = this;
        this._animMgr.on("didAnim", function(count) {
            count > 0 && self.renderEngine.refreshPathNavigators();
        });
        this._pixelToLngLat = function(x, y) {
            var lngLat = SphericalMercator.pointToLngLat([ x, y ], self._maxZoom);
            return new AMap.LngLat(lngLat[0], lngLat[1]);
        };
        this._lngLatToPixel = utils.bind(this.getPixelOfMaxZoom, this);
        this._opts.data && this.setData(this._opts.data);
    }
    utils.inherit(PathSimplifier, EventCls);
    utils.extend(PathSimplifier, {
        supportCanvas: domUtils.isCanvasSupported(),
        Render: {
            Base: BaseRender,
            Canvas: CanvasRender
        },
        getGeodesicPoints: function(start, end, pointsNum) {
            2 === start.length && (start = new AMap.LngLat(start[0], start[1]));
            2 === end.length && (end = new AMap.LngLat(end[0], end[1]));
            pointsNum = pointsNum || 30;
            var segments = pointsNum + 1 || Math.round(Math.abs(start.lng - end.lng));
            if (!segments || Math.abs(start.lng - end.lng) < .001) return [];
            var n, f, A, B, x, y, z, lat, lon, itpLngLats = [], PI = Math.PI, d2r = PI / 180, r2d = 180 / PI, asin = Math.asin, sqrt = Math.sqrt, sin = Math.sin, pow = Math.pow, cos = Math.cos, atan2 = Math.atan2, lat1 = start.lat * d2r, lon1 = start.lng * d2r, lat2 = end.lat * d2r, lon2 = end.lng * d2r, d = 2 * asin(sqrt(pow(sin((lat1 - lat2) / 2), 2) + cos(lat1) * cos(lat2) * pow(sin((lon1 - lon2) / 2), 2)));
            for (n = 1; n < segments; n += 1) {
                f = 1 / segments * n;
                A = sin((1 - f) * d) / sin(d);
                B = sin(f * d) / sin(d);
                x = A * cos(lat1) * cos(lon1) + B * cos(lat2) * cos(lon2);
                y = A * cos(lat1) * sin(lon1) + B * cos(lat2) * sin(lon2);
                z = A * sin(lat1) + B * sin(lat2);
                lat = atan2(z, sqrt(pow(x, 2) + pow(y, 2)));
                lon = atan2(y, x);
                itpLngLats.push(new AMap.LngLat(lon * r2d, lat * r2d));
            }
            return itpLngLats;
        },
        getGeodesicPath: function(start, end, pointsNum) {
            2 === start.length && (start = new AMap.LngLat(start[0], start[1]));
            2 === end.length && (end = new AMap.LngLat(end[0], end[1]));
            var points = [ start ];
            points.push.apply(points, PathSimplifier.getGeodesicPoints(start, end, pointsNum));
            points.push(end);
            return points;
        }
    });
    utils.extend(PathSimplifier.prototype, {
        getRender: function() {
            return this.renderEngine;
        },
        getRenderOption: function(k) {
            return this.renderEngine.getOption(k);
        },
        getRenderOptions: function() {
            return this.renderEngine.getOptions();
        },
        _packPointItem: function(idx) {
            for (var list = this._data.list, i = 0, len = list.length; i < len; i++) if (idx >= list[i].startIdx && idx < list[i].startIdx + list[i].length) {
                var pointIndex = idx - list[i].startIdx;
                return {
                    type: "point",
                    pointIndex: pointIndex,
                    pathIndex: list[i].pathIndex,
                    pathData: this._data.source[list[i].pathIndex]
                };
            }
            return null;
        },
        _packPathItem: function(idx) {
            return {
                type: "path",
                pathIndex: idx,
                pathData: this._data.source[idx]
            };
        },
        _handleClickToSelect: function(e, data) {
            var pathIndex = data.pathIndex;
            this.setSelectedPathIndex(pathIndex);
        },
        getMaxZIndex: function() {
            for (var list = this._data.list, maxZIndex = 0, i = 0, len = list.length; i < len; i++) list[i].zIndex > maxZIndex && (maxZIndex = list[i].zIndex);
            return maxZIndex;
        },
        toggleTopOfPath: function(pathIndex, isTop) {
            var zIndex;
            if (isTop) zIndex = this.getMaxZIndex() + 1; else {
                var zIndexGetter = this._opts.getZIndex;
                zIndex = zIndexGetter.call(this, this.getPathData(pathIndex), pathIndex);
            }
            this.setZIndexOfPath(pathIndex, zIndex);
        },
        getZIndexOfPath: function(pathIndex) {
            var pathInfo = this._getPathRecordByIndex(pathIndex);
            return pathInfo.zIndex;
        },
        setZIndexOfPath: function(pathIndex, zIndex) {
            var pathInfo = this._getPathRecordByIndex(pathIndex);
            pathInfo.setZIndex(zIndex);
            this.renderLater();
        },
        setSelectedPathIndex: function(pathIndex) {
            pathIndex = parseInt(pathIndex, 0);
            pathIndex < 0 && (pathIndex = -1);
            if (this._selectedPathIndex !== pathIndex) {
                var oldPathIndex = this._selectedPathIndex;
                this._selectedPathIndex = pathIndex;
                if (this._opts.onTopWhenSelected) {
                    oldPathIndex >= 0 && this.toggleTopOfPath(oldPathIndex, !1);
                    pathIndex >= 0 && this.toggleTopOfPath(pathIndex, !0);
                }
                this.renderLater();
                this.trigger("selectedPathIndexChanged", {
                    oldIndex: oldPathIndex,
                    newIndex: pathIndex
                });
            }
        },
        getSelectedPathIndex: function() {
            return this._selectedPathIndex;
        },
        isSelectedPathIndex: function(pathIndex) {
            return pathIndex >= 0 && pathIndex === this.getSelectedPathIndex();
        },
        getSelectedPathData: function() {
            var idx = this._selectedPathIndex;
            return idx < 0 ? null : this.getPathData(idx);
        },
        getPathData: function(idx) {
            var item = this._packPathItem(idx);
            return item ? item.pathData : null;
        },
        renderLater: function() {
            this.renderEngine.renderLater.apply(this.renderEngine, arguments);
        },
        render: function() {
            this.renderEngine.render.apply(this.renderEngine, arguments);
        },
        getPixelOfMaxZoom: function(lngLat) {
            lngLat.getLng && (lngLat = [ lngLat.getLng(), lngLat.getLat() ]);
            var maxZoom = this.getMaxZoom(), pMx = SphericalMercator.lngLatToPoint(lngLat, maxZoom);
            return [ Math.round(pMx[0]), Math.round(pMx[1]) ];
        },
        _buildPath: function(path, pathIndex, startPointIdx) {
            var record = new PathDataRecord(pathIndex, startPointIdx);
            record.buildPath(path, this._lngLatToPixel, this._opts);
            return record;
        },
        _buildDataItems: function(data) {
            for (var opts = this._opts, pathGetter = opts.getPath, zIndexGetter = opts.getZIndex, list = this._data.list, bounds = this._data.bounds, startPointIdx = 0, idx = 0, len = data.length; idx < len; idx++) {
                var pathData = data[idx], path = pathGetter.call(this, pathData, idx);
                if (path && path.length) {
                    var pathInfo = this._buildPath(path, idx, startPointIdx);
                    pathInfo.setZIndex(zIndexGetter.call(this, pathData, idx));
                    startPointIdx += pathInfo.length;
                    list[idx] = pathInfo;
                    var pathBounds = pathInfo.bounds;
                    bounds.expandByBounds(pathBounds);
                }
            }
        },
        _buildData: function(data) {
            this._clearData();
            this.trigger("willBuildData", data);
            var dataStore = this._data;
            dataStore.source = data;
            this._buildDataItems(data);
            this._buildKDTree();
            dataStore.kdTree = this._kdTree;
            dataStore.pathNum = dataStore.list.length;
            var lastPath = dataStore.list[dataStore.list.length - 1];
            dataStore.pointNum = lastPath ? lastPath.startIdx + lastPath.length : 0;
            this.trigger("didBuildData", data);
        },
        _getPathRecordByIndex: function(pathIndex) {
            pathIndex = parseInt(pathIndex, 0);
            var dataList = this._data.list;
            if (pathIndex < 0 || pathIndex > dataList.length - 1) throw new Error("pathIndex " + pathIndex + " out of range, it should between 0 and " + (dataList.length - 1));
            return dataList[pathIndex];
        },
        getMaxPathIndex: function() {
            return this._data.list.length - 1;
        },
        createPathNavigator: function(pathIndex, navgOpts) {
            var pathRecord = this._getPathRecordByIndex(pathIndex);
            if (!pathRecord) return null;
            var pathNavigator = new PathNavigator(pathRecord, this._animMgr, utils.extend({}, navgOpts, {
                pixelToLngLat: this._pixelToLngLat
            }));
            this._pathNavgators.push(pathNavigator);
            var self = this;
            pathNavigator.onDestroy(function() {
                self._removePathNavigator(this);
            });
            return pathNavigator;
        },
        _removePathNavigator: function(navg) {
            utils.removeFromArray(this._pathNavgators, navg);
        },
        clearPathNavigators: function() {
            for (var navigs = [].concat(this._pathNavgators), i = 0, len = navigs.length; i < len; i++) navigs[i].destroy();
            0 !== this._pathNavgators.length && console.warn("clearPathNavigators failed!!!");
        },
        getPathNavigators: function() {
            return this._pathNavgators;
        },
        _clearData: function() {
            this.trigger("willClearData");
            this._data ? this._data.list.length = 0 : this._data = {
                list: []
            };
            this._data.source = null;
            this._data.bounds = BoundsItem.getBoundsItemToExpand();
            this._data.kdTree = null;
            this._animMgr.clear();
            this.clearPathNavigators();
            this.trigger("didClearData");
        },
        _buildKDTree: function() {
            if (this._kdTree) {
                this._kdTree.destroy();
                this._kdTree = null;
            }
            this.trigger("willBuildKDTree");
            for (var pathItems = this._data.list, points = [], i = 0, len = pathItems.length; i < len; i++) points.push.apply(points, pathItems[i].points);
            var KDTree = new KDBush(points);
            this._kdTree = KDTree;
            this.trigger("didBuildKDTree", KDTree);
        },
        setData: function(data) {
            data || (data = []);
            this._buildData(data);
            this.renderLater(10);
            data.length && this._opts.autoSetFitView && this.setFitView(-1);
        },
        _setMapBounds: function(nodeBounds) {
            if (nodeBounds && !nodeBounds.isEmpty()) {
                var map = this.getMap(), mapBounds = new AMap.Bounds(this._pixelToLngLat(nodeBounds.x, nodeBounds.y + nodeBounds.height), this._pixelToLngLat(nodeBounds.x + nodeBounds.width, nodeBounds.y));
                map.setBounds(mapBounds, null, null, !0);
            }
        },
        setFitView: function(idx) {
            idx = parseInt(idx, 0);
            var bounds;
            isNaN(idx) || idx < 0 ? bounds = this._setMapBounds(this._data.bounds) : this._data.list && this._data.list[idx] && (bounds = this._data.list[idx].bounds);
            this._setMapBounds(bounds);
        },
        getMap: function() {
            return this._opts.map;
        },
        getMaxZoom: function() {
            return this._opts.zooms[1];
        },
        getMinZoom: function() {
            return this._opts.zooms[0];
        },
        getZooms: function() {
            return this._opts.zooms;
        },
        getOption: function(k) {
            return this._opts[k];
        },
        getOptions: function() {
            return this._opts;
        },
        onRenderReady: function(fn, thisArg) {
            return this.getRender().onReady(fn, thisArg || this);
        },
        isHidden: function() {
            return this.getRender().isHidden();
        },
        show: function() {
            return this.getRender().show();
        },
        hide: function() {
            return this.getRender().hide();
        }
    });
    return PathSimplifier;
});

AMapUI.weakDefine("ui/misc/PathSimplifier", [ "ui/misc/PathSimplifier/main" ], function(m) {
    return m;
});

!function(c) {
    var d = document, a = "appendChild", i = "styleSheet", s = d.createElement("style");
    s.type = "text/css";
    d.getElementsByTagName("head")[0][a](s);
    s[i] ? s[i].cssText = c : s[a](d.createTextNode(c));
}(".amap-ui-pathsimplifier-container{cursor:default;-webkit-backface-visibility:hidden;-webkit-transform:translateZ(0) scale(1,1)}.amap-ui-pathsimplifier-container canvas{position:absolute}.amap-ui-pathsimplifier-container .amap-ui-hide{display:none!important}.amap-ui-pathsimplifier-container .overlay-title{color:#555;background-color:#fffeef;border:1px solid #7e7e7e;padding:2px 6px;font-size:12px;white-space:nowrap;display:inline-block;position:absolute;border-radius:2px;z-index:99999}.amap-ui-pathsimplifier-container .overlay-title:after,.amap-ui-pathsimplifier-container .overlay-title:before{content:'';display:block;position:absolute;margin:auto;width:0;height:0;border:solid transparent;border-width:5px}.amap-ui-pathsimplifier-container .overlay-title.left{transform:translate(10px,-50%)}.amap-ui-pathsimplifier-container .overlay-title.left:before{top:5px}.amap-ui-pathsimplifier-container .overlay-title.left:after{left:-9px;top:5px;border-right-color:#fffeef}.amap-ui-pathsimplifier-container .overlay-title.left:before{left:-10px;border-right-color:#7e7e7e}.amap-ui-pathsimplifier-container .overlay-title.top{transform:translate(-50%,-130%)}.amap-ui-pathsimplifier-container .overlay-title.top:before{left:0;right:0}.amap-ui-pathsimplifier-container .overlay-title.top:after{bottom:-9px;left:0;right:0;border-top-color:#fffeef}.amap-ui-pathsimplifier-container .overlay-title.top:before{bottom:-10px;border-top-color:#7e7e7e}");