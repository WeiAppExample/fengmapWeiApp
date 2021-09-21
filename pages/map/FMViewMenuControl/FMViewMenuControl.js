// component/FMViewModeControl/FMViewModeControl.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {


  },

  /**
   * 组件的初始数据
   */
  data: {
    size: 90,
    color: "#3F82FD",
    tabCur1: 3,
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
    tabChange(e) {
      console.log(e)
      if(e.detail.index==0){
        // 搜索
        wx.navigateTo({
          url: '../../packageMain/select/select',
        })
      }else if(e.detail.index==1){
        // 直播
        this.tab(2);
      }else if(e.detail.index==2){
        // 展商
        this.tab(0);
      }else if(e.detail.index==3) {
        // 展品
        this.tab(1);
      }else if(e.detail.index==4) {
        // 活动
        this.tab(4);
      }else if(e.detail.index==5) {
        // 资讯
        this.tab(5);
      }else if(e.detail.index==6) {
        // 参展助手
        this.tab(8);
      }else if(e.detail.index==7) {
        // 我的信息
        wx.navigateTo({
          url: '/packageMain/mine/mine',
        })
      }
    },
  
    // 顶部tab切换跳转
    tab(index) {
      wx.navigateTo({
        url: '../../packageMain/index/index?switch=switch' + index + "&tabindex=" + index,
      })
    },    
  }
})
