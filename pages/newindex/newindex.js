// pages/newindex/newindex.js
const app = getApp()
const CONFIG = require('../../config.js')
import {fengmap} from '../map/fengmap.miniprogram.min.js';
//import LocSDK from '../map/locSDK';

let endPointLast;
let startPointLast;
let moveDistanceLast = 0;
let topLast;
Page({
    // 定义全局map变量
    fmap: null,
    //定义定位点marker
    locationMarker: null,
    //定位sdk实例
    locSDK: null,
    // 判断当前是否点击的是poi,控制点击公共设施的时候只弹出公共设施的信息框
    clickedPOI: false,
    // 点击事件ID
    eventID: null,
    // 定义选中模型
    selectedModel: null,
    // imagemarker对象
    imMarker: [],
    // textmarker对象
    textMarker: [],
    // marker图层
    layer: null,
    //0 默认 1 地图移动  2 图层移动
    pageMovingType:0,
    /**
     * 页面的初始数据
     */
    data: {
        mapHeight:'100%',
        //mapWidth:'100%',
        navHeight: app.globalData.navHeight,
        statusHeight: app.globalData.statusHeight,
        imgUrl: app.globalData.imgUrl,
        mapLoaded: false, //地图是否加载完成
        buttonTop: 0,
        blankH: 100,       //地图上下预留空间
        tabData1: [
            {
              icon: '/pages/imgs/newImg/iconSearch.png',
              name: '搜索'
            },
            {
              icon: '/pages/imgs/newImg/iconLive.png',
              name: '直播'
            },
            {
              icon: '/pages/imgs/newImg/iconExhibitors.png',
              name: '展商'
            },
            {
              icon: '/pages/imgs/newImg/iconExhibits.png',
              name: '展品'
            },
            {
              icon: '/pages/imgs/newImg/iconActive.png',
              name: '活动'
            },
            {
              icon: '/pages/imgs/newImg/iconInformition.png',
              name: '资讯'
            },
            {
              icon: '/pages/imgs/newImg/iconHelper.png',
              name: '参展助手'
            },
            {
              icon: '/pages/imgs/newImg/iconMine.png',
              name: '个人信息'
            }
        ],
        flag:false,
        os:app.globalData.os,
        hkindex: 0,//视频滑块index
        flagVideo:true //视频显示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       
        let that = this;
        if (options.dataId) {
            //从短信过来，修改客户手机号
            wx.login({
                success: res => {
                    // 发送 res.code 到后台换取 openId, sessionKey
                    wx.setStorageSync('code', res.code);
                   
                }
            })
        }

        wx.getSystemInfo({
            success: function (res) {
                //console.log(res.windowWidth);
                //console.log(" console.log(res.windowHeight);");
                //console.log(res.windowHeight);

                topLast = res.windowHeight / 2 ;
                let buttonTopMax = 120 + 500;//res.windowHeight-that.data.blankH;
                if(that.data.os == "ios"){
                    //buttonTopMax = 120 + 500;
                }
                let mapMaxHeight = res.windowHeight-that.data.blankH-120;
                let minMapHeight = res.windowHeight / 2 ;

                that.setData({
                    windowW: res.windowWidth,
                    windowH: res.windowHeight,
                    //mapHeight: mapMaxHeight,
                    minMapHeight: minMapHeight,
                    mapMaxHeight:mapMaxHeight,
                    buttonTopMax:buttonTopMax,
                    buttonTop: res.windowHeight / 2
                })
            },
        })

        wx.setStorageSync('adMapIsShow', false)
        if (!wx.getStorageSync('adMapIsShow')) {
            this.setData({
              flag: true,
            });

            setTimeout(() => {
              this.setData({
                mapTop:-1000,
              });

            }, 1000);
            wx.setStorageSync('adMapIsShow', true)
          } else {
            this.setData({
              flag: false
            });
          }

          that.initMap();
    },

    bindVideoPlay:function(){
        this.setData({
            flag: false
        });
    },
    getPxIos(v){
        //px = rpx / 750 * wx.getSystemInfoSync().windowWidth;
        return v / 750 * this.data.windowW ;
    },
    bindVideoEnd:function(){
        var mapHeight = this.data.minMapHeight;
        if(this.data.os=="ios"){
            //mapHeight = this.data.mapMaxHeight;
           // mapHeight = this.getPxIos(mapHeight)*2;
        }
        //var mapWidth = this.data.windowW;
        if(this.data.os=="ios"){
            //mapWidth = "750px";
            //mapWidth = this.getPxIos(mapWidth)*2+"px";
        }else{
            //mapWidth = mapWidth+"px";
        }

        //px = rpx / 750 * wx.getSystemInfoSync().windowWidth;
        var mapTop = this.getPxIos(240) -5;
        this.setData({
            flagVideo: false,
            mapHeight:mapHeight+ 'px',
            //mapWidth:mapWidth,
            mapTop:mapTop,
        });
    },
    bindVideoEnd2:function(){
        //点击--》关闭第二个视频开关控制
        /* this.setData({
            flagVideo: false,
            mapTop:0,
        }); */
    },
    bindVideoChange(e) {
        this.setData({
         hkindex: e.detail.current
        })
    },
    bindVideoTap(e) {
        this.setData({
          hkindex: 1
        })
     },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    onShareAppMessage: function () {
        return {
            title: "中国工博会在线",
            // path: '/pages/index/index',
            imageUrl: 'https://mis-pv.ciif365.cn/gbhwxApp/logoPic.png',
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        if (this.fmap) {
            this.fmap.dispose();
            this.fmap = null;
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    // 手指触摸动作开始
    touchStart(e) {
        //判断点击点，在哪个面板范围
        this.pageMovingType = this.getTouchPanel(e);
        if( this.pageMovingType==1){

            this.canvas.dispatchTouchEvent({
                ...e,
                type: 'touchstart'
            })
        }
    },
    // 手指触摸后移动
    touchMove(e) {

        if(this.pageMovingType !=1 ){
            return;
        }
        this.canvas.dispatchTouchEvent({
            ...e,
            type: 'touchmove'
        })
    },
    // 手指触摸动作结束
    touchEnd(e) {
        if(this.pageMovingType !=1 ){
            return;
        }

        this.canvas.dispatchTouchEvent({
            ...e,
            type: 'touchend'
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    initMap(){
        let that = this;
        //let mapId = this.data.os =='ios'?'fengMapIos':'fengMap';
        // 获取canvas
        wx.createSelectorQuery().select('#fengMap').node().exec((res) => {
            const canvas = res[0].node;
            this.canvas = canvas

            wx.createSelectorQuery().select("#temp").node().exec((tempRes) => {
                const tmpCanvas = tempRes[0].node;

                const fmapID = "1438357078370115586";

                const mapOptions = {
                    //必要，地图容器
                    canvas: canvas,
                    // 必要，2d画布
                    tempCanvas: tmpCanvas,
                    enabledPanRange:true, //否开启平移地图范围限制,默认为false
                    //defaultScaleLevel: 12,
                    minScaleLevel:15,
                    maxScaleLevel:23,
                    defaultMapScaleLevel: 15,	 //设置地图初始显示比例尺级别。范围为1-29之间的整数值。如29级的比例尺为1:1厘米。
                    mapScaleLevelRange: [15,16, 17, 18, 19, 20, 21, 22, 23], // 设置比例尺级别可缩放范围， 通常室内地图使用到的范围为16级到23级。即：[16,23]。
                    // 地图默认旋转角度
                    defaultControlsPose: 90,
                    // 地图默认倾斜角
                    defaultTiltAngle: 60,
                    defaultBackgroundColor:"#687ABC",
                    // 初始二维/三维状态,默认3D显示
                    defaultViewMode: this.data.is3D ? fengmap.FMViewMode.MODE_3D : fengmap.FMViewMode.MODE_2D,
                    // 设置初始指南针的偏移量
                    //compassOffset: [40, 40],
                    // 设置指南针大小
                    //compassSize: 48,
                    //必要，地图应用名称，通过蜂鸟云后台创建
                    appName: '工博会2021',
                    //必要，地图应用密钥，通过蜂鸟云后台获取
                    key: 'd28ca40d84f1f491dd82bd67f6fb732b',
                };

                //初始化地图对象
                this.fmap = new fengmap.FMMap(mapOptions);

                //打开Fengmap服务器的地图数据和主题
                this.fmap.openMapById(fmapID, function (error) {
                    //打印错误信息
                    console.log(error);
                });

                // this.fmap.moveTo({
                //   x: this.fmap.center.x+10,             //目标点x在中心点坐标基础上再加10米
                //   y: this.fmap.center.y+10              //目标点y在中心点坐标基础上再加10米
                //FloorNum: 3,      //可选，设置聚焦到某一层
                //callback: func,   //可选完成后执行回调
                //time: 3,          //可选地图视角移动过去的时间
                //})
                //地图加载完成事件
                this.fmap.on('loadComplete', () => {
                    console.log('地图加载完成');
                    this.setData({
                        mapLoaded: true,
                    })
                    this.mapComplete();
                })

                // 初始化定位sdk
                /* this.locSDK = new LocSDK();
                // 实时定位
                this.locSDK.updateLocation((data) => {
                    if (this.data.mapLoaded) {
                        this.addOrMoveLocationMarker(data)
                    }
                }) */

                /**
                 * 地图点击事件
                 * 通过点击地图，获取位置坐标
                 * */
                this.fmap.on('mapClickNode', (event) => {
                    that.mapClickNode(event)
                })
                //过滤是否可触发点击事件mapClickNode方法的地图元素，返回true为可触发
                this.fmap.pickFilterFunction = function (event) {
                    //如设置点击墙模型时不高亮
                    if (event.typeID === 300000) {
                        return false;
                    }
                    return true;
                };

            })
        })
    },
    mapComplete() {
        let that = this;
        // 设置楼层数据
        this.loadScrollFloorCtrl();

        // 显示指北针
        //this.showCompass();

        this.addImageMarker();
        //this.addTextMarker();
       /*  setTimeout(function () {
            that.slideIn();
        }, 3000)
         */

        /*
            let query = wx.createSelectorQuery()
                query.select('#mainContent').boundingClientRect( (rect) => {
                    let top = rect.top
                    this.setData({buttonTop:top})

                }).exec()*/
    },
    mapClickNode(event){
        var that = this;
        //console.log(event);
        if (!event.nodeType) {
            if (this.selectedModel) {
                this.selectedModel.selected = false;
            }
        }
        //地图模型
        const target = event.target;
        if (!target) {
            return;
        }

        let info = '';

        //筛选点击类型,打印拾取信息
        switch (target.nodeType) {
            //地面模型
            case fengmap.FMNodeType.FLOOR:
                if (this.clickedPOI && event.eventInfo.eventID === this.eventID) return;
                info = `地图位置坐标：x:${event.eventInfo.coord.x}，y:${event.eventInfo.coord.y}`;
                if (this.selectedModel) {
                    this.selectedModel.selected = false;
                }
                //弹出信息框
                /* wx.showModal({
                  title: '拾取对象类型：地图',
                  content: info,
                  showCancel: false,
                }) */
                break;

            //model模型
            case fengmap.FMNodeType.MODEL:
                if (this.clickedPOI && event.eventInfo.eventID === this.eventID) {
                    this.clickedPOI = false;
                    return;
                }
                //过滤类型为墙的model
                if (target.typeID === 300000) {
                    //其他操作
                    return;
                }
                info = `FID：${target.FID}
                        model中心点坐标：x: ${target.mapCoord.x}，y:${target.mapCoord.y}
                        地图位置坐标：x: ${event.eventInfo.coord.x}，y:${event.eventInfo.coord.y}`

                //模型高亮
                if (this.selectedModel && this.selectedModel.FID != target.FID) {
                    this.selectedModel.selected = false;
                }
                target.selected = true;
                this.selectedModel = target;

                that.fmap.scaleLevelOut()
                //that.fmap.moveTo(event.eventInfo.coord.x,event.eventInfo.coord.y)
                //弹出信息框
                /*  wx.showModal({
                   title: '拾取对象类型：模型',
                   content: info,
                   showCancel: false,
                 }) */
                break;

            //公共设施、图片标注模型
            case fengmap.FMNodeType.FACILITY:
            case fengmap.FMNodeType.IMAGE_MARKER:
                this.clickedPOI = true;
                this.eventID = event.eventInfo.eventID;
                info = `地图位置坐标：x: ${event.eventInfo.coord.x}，y: ${event.eventInfo.coord.y}`;
                if (this.selectedModel) {
                    this.selectedModel.selected = false;
                }
                //弹出信息框
                /* wx.showModal({
                  title: '拾取对象类型：公共设施',
                  content: info,
                  showCancel: false,
                }) */
                break;
        }
    },
    //动画 -- 滑入
    slideIn: function () {

        this.animation = wx.createAnimation({
            duration: 1000,//动画的持续时间
            timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
        })
        //750
        this.animation.translateY(1000).step() // 在y轴偏移，然后用step()完成一个动画
        this.setData({
            //动画实例的export方法导出动画数据传递给组件的animation属性
            animationData: this.animation.export()
        })
    },
    //动画 -- 滑出
    slideDown: function () {
        this.animation.translateY(300).step()
        this.setData({
            animationData: this.animation.export(),
        })
    },
    getTouchPanel(e){
        var start = e.touches[0];
        var top = this.data.buttonTop;
        var pageMovingType = 0;
        //console.log("e:"+JSON.stringify(e));
        //console.log("start:"+JSON.stringify(start));
        if(!start && e.changedTouches && e.changedTouches.length>0){
            start = e.changedTouches[0]
        }
        if(start && start.clientY){
            //console.log("start.clientY:"+start.clientY);
            //console.log("top:"+top);
            //console.log("mapHeight:"+this.data.mapHeight);
            if(top-20 <= start.clientY){//+10 偏移量
                pageMovingType = 2;
            }else {
                pageMovingType = 1;
            }
        }

        if(!start){
            pageMovingType = 2;
        }

        //console.log("pageMovingType:"+pageMovingType);
        return pageMovingType;
    },
    getMapHeight(top){
        var mapHeight = this.data.mapMaxHeight;
        if(this.data.os=="ios"){
            return mapHeight;
        }
        if (top < this.data.windowH / 2 ) {
            mapHeight = this.data.minMapHeight;
        }
        return mapHeight;
    },
    buttonStart: function (e) {
        //判断点击点，在哪个面板范围
        this.pageMovingType = this.getTouchPanel(e);
        if( this.pageMovingType==2){
            startPointLast = e.touches[0];
            moveDistanceLast = 0;
        }
    },
    buttonMove: function (e) {

        if(this.pageMovingType !=2 ){
            return;
        }
        var that = this;
        //console.log("buttonMove")
        var endPoint = e.touches[e.touches.length - 1];

        var moveTotalDistance = startPointLast.clientY - endPoint.clientY;
        var moveDistance = moveTotalDistance - moveDistanceLast; //移动距离-上次移动距离 move存在重复移动，减去重复值
        //console.log("moveTotalDistance:", moveTotalDistance);
        //console.log("moveDistance:",  moveDistance);
        //console.log("moveDistanceLast:",  moveDistanceLast);

        moveDistanceLast = moveTotalDistance;
        endPointLast = endPoint;

        var top = 0;
        //判断移动方向 ，向上、向下
        //console.log("topLast:",topLast)
        if (moveTotalDistance >= 0) {//向上W
            top = (topLast - moveDistance);
            //console.log("向上:",top)
        } else {
            top = (topLast - moveDistance);
            //console.log("向下:",top)
        }
        //判断下移最低位置
        if(top > this.data.buttonTopMax){
            top = this.data.buttonTopMax
        }

        var mapHeight = this.getMapHeight(top);

        topLast = top;
        /* this.setData({
            mapHeight: mapHeight + 'px',
            buttonTop: top
        }) */

        let query = wx.createSelectorQuery()
        query.select('#mainContent').boundingClientRect( (rect) => {

            let height = rect.height
            //console.log("buttonEnd top"+top);
            //console.log("buttonEnd height"+height);
            //计算浮层底部，不能离开bottom 0；
            if(top <  that.data.windowH-height ){
                top = that.data.windowH-height;
            }
            that.setData({
                mapHeight: mapHeight + 'px',
                buttonTop: top
            })
        }).exec()

    },
    buttonEnd: function (e) {

        if(this.pageMovingType !=2 ){
            return;
        }
        var that = this;
        //console.log("=================buttonEnd===================")
        var endPoint = endPointLast;

        var mapHeight = this.data.mapMaxHeight
        var moveTotalDistance = startPointLast.clientY - endPoint.clientY;

        if (endPoint && endPoint.clientY != null) {
            var top = this.data.buttonTop;

            //判断下移最低位置
            if(top > this.data.buttonTopMax){
                top = this.data.buttonTopMax
            }

            if (top < this.data.windowH / 2 && top > this.data.blankH) {
                top = this.data.blankH+100;
            } else if (top > this.data.windowH / 2 && top < this.data.buttonTopMax) {
                top = this.data.buttonTopMax;
            }

            if (moveTotalDistance >= 0) {
                //向上
                if (top > this.data.blankH+100) {
                    top = this.data.blankH+100;
                }
            } else {
                //向下
                if (top < this.data.buttonTopMax) {
                    //top = this.data.buttonTopMax;
                }
            }

            if (top < this.data.windowH / 2) {
                mapHeight = this.data.minMapHeight
            }

            let query = wx.createSelectorQuery()
            query.select('#mainContent').boundingClientRect( (rect) => {
                let topRect = rect.top
                let height = rect.height
                //console.log("buttonEnd top"+top);
                //console.log("buttonEnd height"+height);
                //计算浮层底部，不能离开bottom 0；

                if(top <  that.data.windowH-height ){
                    top = that.data.windowH-height;
                }
                that.setData({
                    mapHeight: mapHeight + 'px',
                    buttonTop: top
                })
            }).exec()
        }
        //console.log("buttonTopMax:",this.data.buttonTopMax);
        //console.log("buttonTop:",this.data.buttonTop);
        //console.log("mapHeight:",this.data.mapHeight);

    },

    /**
     * 显示指北针
     */
    showCompass() {
        /**
         * 显示指北针，设置背景色需要在加载指北针之前设置
         * */
        this.fmap.compass.setBgImage('../map/images/compass_bg.png'); //设置背景图片
        this.fmap.compass.setFgImage('../map/images/compass_fg.png'); //设置前景图片
        this.fmap.showCompass = true;

        // 点击指北针事件, 使角度归0
        this.fmap.on('mapClickCompass', () => {
            this.fmap.rotateTo({
                //设置角度
                to: 0,
                //动画持续时间，默认为。3秒
                duration: 0.3,
                callback: function () { //回调函数
                    //console.log('rotateTo complete!');
                }
            })
        });
    },

    /**
     * 2D/3D切换
     */
    changeMode() {
        if (this.fmap) {
            if (!this.data.is3D) {
                // 切换地图为三维模式
                this.fmap.viewMode = fengmap.FMViewMode.MODE_3D;
            } else {
                // 切换地图为二维模式
                this.fmap.viewMode = fengmap.FMViewMode.MODE_2D;
            }
        }
        //更改状态
        this.setData({
            is3D: !this.data.is3D
        })
    },
    ///////////////////////////////////////////////
    // 楼层控件回调事件(start)
    //////////////////////////////////////////////
    // 设置楼层数据
    loadScrollFloorCtrl: function () {
        // 获取楼层id
        let groupIDs = [];
        this.fmap.listGroups.map((ls) => {
            let obj = {
                alias: ls.alias,
                gid: ls.gid,
                gname: ls.gname
            }
            groupIDs.push(obj);
            return obj;
        });

        this.setData({
            mapGroupIDs: groupIDs.reverse(),
            focusGroupID: this.fmap.focusGroupID
        })

    },
    // 切换楼层
    switchGroup(e) {
        if (this.fmap) {
            this.fmap.focusGroupID = e.detail;
            this.setData({
                focusGroupID: e.detail
            })
        }
    },
    switchZoomOut(e) {
        this.fmap.scaleLevelOut()
    },
    switchZoomIn(e) {
        this.fmap.scaleLevelIn()
    },
    /**
     * 切换单、多层
     * @param {*} e
     */
    switchLayers() {
        if (this.fmap) {
            if (!this.data.isAllLayer) {
                this.fmap.visibleGroupIDs = this.fmap.groupIDs;
            } else {
                this.fmap.visibleGroupIDs = [this.fmap.focusGroupID];
            }
        }
        //更改状态
        this.setData({
            isAllLayer: !this.data.isAllLayer
        })
    },
    // locationMarker
    addOrMoveLocationMarker(data) {
        if (!this.locationMarker) {
            /**
             * fengmap.FMLocationMarker 自定义图片标注对象，为自定义图层
             */
            this.locationMarker = new fengmap.FMLocationMarker(this.fmap, {
                //x坐标值
                x: data.x,
                //y坐标值
                y: data.y,
                //图片地址
                url: '../map/images/location.png',
                //楼层id
                groupID: 1,
                //图片尺寸
                size: 48,
                //marker标注高度
                height: 3,
                callback: function () {
                    //回调函数
                    //console.log('定位点marker加载完成！');
                }
            });
            //添加定位点marker
            this.fmap.addLocationMarker(this.locationMarker);
        } else {
            //旋转locationMarker
            this.locationMarker.rotateTo({
                to: data.angle,
                duration: 1
            });
            //移动locationMarker
            this.locationMarker.moveTo({
                x: data.x,
                y: data.y,
                groupID: 1
            });
        }
    },

    /**
     * 删除图片按钮事件
     */
    deleteMarkerFunc(e) {
        // 删除layer上所有Marker
        if (this.layer) {
            this.layer.removeAll();
        }
    },

    /**
     * fengmap.FMImageMarker 自定义图片标注对象，为自定义图层。
     */
    addImageMarker() {
        var that = this;
        //获取当前聚焦楼层
        const group = this.fmap.getFMGroup(this.fmap.focusGroupID);

        /*//实例化方法1：自定义图片标注层
         this.layer = new fengmap.FMImageMarkerLayer();
         //添加图片标注层到模型层
         group.addLayer(this.layer);*/

        //实例化方法2：
        //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
        this.layer = group.getOrCreateLayer('imageMarker');

        //图标标注对象，默认位置为该楼层中心点 {x: 13503179.0532718, y: 3657662.1835356}
        let gpos = group.mapCoord;
        let list = [
            {
                x: 13503179.0532718,
                y: 3657662.1835356,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_305.png'
            },
            {
                x: 13502950.6593166,
                y: 3657570.3444,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_308.png'
            },
            {
                x: 13502763.082755,
                y: 3657504.3027744,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_309.png'
            },
            {
                x: 13502622.2856782,
                y: 3657326.3572832,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_310.png'
            },
            {
                x: 13502487.909315,
                y: 3657671.241328,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_320.png'
            },
            {
                x: 13502413.6124862,
                y: 3657856.9834,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_321.png'
            },
            {
                x: 13502726.8515854,
                y: 3657929.9043616,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_322.png'
            },
            {
                x: 13502938.7351342,
                y: 3658060.7264012,
                url: 'https://mis-pv.ciif365.cn/gbhwxApp/marker/marker_323.png'
            }
        ]
        list.forEach(function(item){
            var im = new fengmap.FMImageMarker(that.fmap, {
                //标注x坐标点
                x: item.x,
                //标注y坐标点
                y: item.y,
                //设置图片路径
                url: item.url,
                //设置图片显示尺寸
                size: 32,
                //标注高度，大于model的高度
                height: 4
            });

            that.imMarker.push(im);
            /**
             * imageMarker添加自定义属性
             **/
            //this.im.selfAttr = '自定义属性selfAttr';

            that.layer.addMarker(im);
        })

    },

      /**
   * fengmap.FMTextMarker 自定义文本标注对象，为自定义图层。
   */
  addTextMarker() {
    //获取当前聚焦楼层
    let group = this.fmap.getFMGroup(this.fmap.focusGroupID);
    //返回当前层中第一个textMarkerLayer,如果没有，则自动创建
    this.layer = group.getOrCreateLayer('textMarker');

    //文字标注对象，默认位置为该楼层中心点
    let gpos = group.mapCoord;
    this.tm = new fengmap.FMTextMarker(this.fmap, {
      //标注x坐标点
      x: gpos.x,
      //标注y坐标点
      y: gpos.y,
      //标注值
      name: "工博会主会场",
      //文本标注填充色
      fillcolor: "255,0,0",
      //文本标注字体大小
      fontsize: 14,
      //文本标注边线颜色
      strokecolor: "255,255,0"
    });

    /**
     * textMarker添加自定义属性
     **/
    this.tm.selfAttr = '自定义属性selfAttr';

    //文本标注层添加文本Marker
    this.layer.addMarker(this.tm);
  }
})
