// pages/move/move.js
Page({
 
    /**
     * 页面的初始数据
     */
    data: {
      x: 0,
      y: 0,
      windowW: 0,
      windowH: 0,
      rW: 60,
      rH: 60,
    },
   
    _minMove: function (e) {
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
        x,
        y
      });
    },
   
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.setData({
        windowW: wx.getSystemInfoSync().windowWidth,
        windowH: wx.getSystemInfoSync().windowHeight
      });
    },
   
    
  })