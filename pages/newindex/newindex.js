// pages/newindex/newindex.js
const app = getApp()
const CONFIG = require('../../config.js')
import {fengmap} from '../map/fengmap.miniprogram.min.js';
import LocSDK from '../map/locSDK';

let startPoint;
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
    /**
     * 页面的初始数据
     */
    data: {
        mapHeight: '100%',
        navHeight: app.globalData.navHeight,
        statusHeight: app.globalData.statusHeight,
        imgUrl: app.globalData.imgUrl,
        mapLoaded: false, //地图是否加载完成
        buttonTop: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;

        wx.getSystemInfo({
            success: function (res) {
                //console.log(res.windowWidth);
                //console.log(" console.log(res.windowHeight);");
                //console.log(res.windowHeight);
                that.setData({
                    windowW: res.windowWidth,
                    windowH: res.windowHeight,
                    buttonTop: res.windowHeight - 50
                })
            },
        })

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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
        this.canvas.dispatchTouchEvent({
            ...e,
            type: 'touchstart'
        })
    },
    // 手指触摸后移动
    touchMove(e) {
        this.canvas.dispatchTouchEvent({
            ...e,
            type: 'touchmove'
        })
    },
    // 手指触摸动作结束
    touchEnd(e) {
        this.canvas.dispatchTouchEvent({
            ...e,
            type: 'touchend'
        })
    },

    onTestInfo() {
        if (this.data.mapHeight == '100%') {
            this.setData({mapHeight: '50%'})
        }
        if (this.data.mapHeight == '50%') {
            this.setData({mapHeight: '100%'})
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
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
                    defaultScaleLevel: 12,
                    // 地图默认旋转角度
                    defaultControlsPose: 90,
                    // 地图默认倾斜角
                    defaultTiltAngle: 60,
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
                    this.fmap.scaleLevelTo(2);
                    this.mapComplete();
                })

                // 初始化定位sdk
                this.locSDK = new LocSDK();
                // 实时定位
                this.locSDK.updateLocation((data) => {
                    if (this.data.mapLoaded) {
                        this.addOrMoveLocationMarker(data)
                    }
                })

            })
        })
    },

    mapComplete() {
        let that = this;
        // 设置楼层数据
        this.loadScrollFloorCtrl();

        // 显示指北针
        //this.showCompass();

        setTimeout(function () {
            that.slideIn();
        }, 3000)

        /*
            let query = wx.createSelectorQuery()
                query.select('#mainContent').boundingClientRect( (rect) => {
                    let top = rect.top
                    this.setData({buttonTop:top})

                }).exec()*/
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

    buttonStart: function (e) {
        startPoint = e.touches[0]
    },
    buttonMove: function (e) {
        let endPoint = e.touches[e.touches.length - 1];
        //let translateX = endPoint.clientX - startPoint.clientX;
        let translateY = endPoint.clientY - startPoint.clientY;
        startPoint = endPoint;
        let buttonTop = this.data.buttonTop + translateY;


        if (buttonTop <= 0) {
            // buttonTop = 0
        }
        // 50是按钮的高度
        if (buttonTop + 50 >= this.data.windowHeight) {
            //buttonTop = this.data.windowHeight - 50;
        }
        this.setData({
            buttonTop: buttonTop
        }) /*

    const {
      rH,
      rW,
      windowH,
      windowW
    } = this.data;
    let x = e.changedTouches[0].pageX;
    let y = e.changedTouches[0].pageY;

    if (e.changedTouches[0].pageX < 0) {
      x = 0;
    } else if (e.changedTouches[0].pageX >= (windowW - rW / 2)) {
      x = windowW - rW / 2;
    };

    if (e.changedTouches[0].pageY < 0) {
      y = 0;
    } else if (e.changedTouches[0].pageY >= (windowH - rH / 2)) {
      y = windowH - rH / 2;
    };

    this.setData({
      buttonTop:y
    });
        */
    },
    buttonEnd: function (e) {

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
                    console.log('rotateTo complete!');
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
                    console.log('定位点marker加载完成！');
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
    }


})
