// pages/newestindex/newestindex.js
const CONFIG = require('../../config.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userType: wx.getStorageSync('userType'),
    loginType: wx.getStorageSync('loginType'),
  },

  // 展商观众角色切换
  tabUser() {
    let str;
    let that = this;
    if (wx.getStorageSync('loginType') == 0) {
      str = '展商'
    } else {
      str = '观众'
    }
    let newType = wx.getStorageSync('loginType') == 0 ? 1 : 0;
    wx.showModal({
      title: '提示',
      content: '是否要切换到' + str + '角色？',
      success: function (res) {
        if (res.confirm == true) {
          app.req('visitorWMP/changeUser', "get", {
            loginType: newType,
            openId: wx.getStorageSync('openId')
          }, function (res) {
            if (res.data.code == '200') {
              if (res.data.data.parentCode && res.data.data.parentCode == '0') {
                wx.setStorageSync('sessionId', res.data.data.openId);
                if (wx.getStorageSync('loginType') == 0) {
                  wx.navigateTo({
                    url: '../login/login1?userType=1',
                  })
                }
              } else {
                wx.setStorageSync('unionId', res.data.data.unionId);
                wx.setStorageSync('openId', res.data.data.openId);
                wx.setStorageSync('userCode', res.data.data.userCode);
                wx.setStorageSync('sessionId', res.data.data.openId);
                wx.setStorageSync('step', res.data.data.userProfile.step);
                wx.setStorageSync('token', res.data.data.token);
                wx.setStorageSync('userType', res.data.data.userProfile.userType);
                wx.setStorageSync('loginType', res.data.data.userProfile.loginType);
                console.log(res.data.data.userProfile)
                app.globalData.icon = res.data.data.userProfile.icon;
                app.globalData.nickname = res.data.data.userProfile.nickName;
                app.globalData.userType = res.data.data.userProfile.userType;
                app.globalData.loginType = res.data.data.userProfile.loginType;
                // globalData 存微信头像昵称 在comps/chat/inputbar/suit/main发送消息时存入
                that.setData({
                  loginType: res.data.data.userProfile.loginType,
                  userType: res.data.data.userProfile.userType,
                })
                app.globalData.userIM = res.data.data.userProfile;
                wx.setStorage({
                  key: "myUsername",
                  data: res.data.data.userProfile.imId //im登录账户
                });
                // WebIM.conn.open({
                //   apiUrl: WebIM.config.apiURL,
                //   user: res.data.data.userProfile.imId, //im登录账户
                //   pwd: 'exhibition@365me#Pwd1586',
                //   appKey: WebIM.config.appkey
                // });
                console.log("关闭IM：");
                //WebIM.conn.close();
                app.popTest('切换成功！')
                that.onLoad();

                app.reInitIM(true);
              }
            }
          })
          if (that.data.userType == 0) {
            // wx.navigateTo({
            //   url: '../login/login1?userType=1',
            // })
          }
          if (that.data.userType == 1) {

          }
          if (that.data.userType == 2) {

          }

        }
      }
    })
  },


  // 我的名片
  toMyCardTap: function () {
    wx.navigateTo({
      url: "/pages/mine/myCard/index"
    });
  },

  // 我的收藏
  toCollectTap: function () {
    wx.navigateTo({
      url: "/pages/collect/home/index"
    });
  },

  // 我的聊天
  goChart() {
    if(CONFIG.imEnable){
      /**自己的IM实现 */
      wx.navigateTo({
        url: '/packageC/pages/chat-list/chat-list',
      })
    }else{
      wx.navigateTo({
        url: '../chat/chat',
      })
    }
 
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})