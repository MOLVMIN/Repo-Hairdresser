// pages/evaluate_context/evaluate_context.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: 0,
    shopId: 0,
    shopName: '',
    hairId: 0,
    hairName: '',
    hairImageId: 0,
    hairImagePath: '',
    shopMark: 0,
    hairMark: 0,
    shopStarLevelList: ['/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png'],
    hairStarLevelList: ['/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png'],
    shopComment: '亲！请留下您的评价，下次为你提供更优质的服务。。。',
    hairComment: '亲！请留下您的评价，下次为你提供更优质的服务。。。',
    onCommit: false,
    isAllCommitted: 0,

    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      shopId: options.shopId,
      shopName: options.shopName,
      hairId: options.hairId,
      hairName: options.hairName,
      hairImageId: options.hairImageId,
      hairImagePath: app.http.host + 'images/f/' + options.hairImageId,
      onCommit: false,
      options: options
    })
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
    app.refreshTokenInfoNoCallback()
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
    wx.showNavigationBarLoading() //在标题栏中显示加载

    var that = this
    //模拟加载
    setTimeout(function () {
      that.setData({
        orderId: 0,
        shopId: 0,
        shopName: '',
        hairId: 0,
        hairName: '',
        hairImageId: 0,
        hairImagePath: '',
        shopMark: 0,
        hairMark: 0,
        shopStarLevelList: ['/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png'],
        hairStarLevelList: ['/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png', '/imgs/star_gray.png'],
        shopComment: '亲！请留下您的评价，下次为你提供更优质的服务。。。',
        hairComment: '亲！请留下您的评价，下次为你提供更优质的服务。。。',
        onCommit: false,
        isAllCommitted: 0,
      })
      that.onLoad(that.data.options)

      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
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

  },

  shopStarEvent: function (e) {
    var index = e.currentTarget.dataset.index
    var levelList = []
    for (var i = 0; i < 5; i++) {
      if (i <= index) {
        levelList[i] = '/imgs/star_active.png'
      }
      else {
        levelList[i] = '/imgs/star_gray.png'
      }
    }
    var that = this
    that.setData({
      shopStarLevelList: levelList,
      shopMark: index + 1,
    })
  },

  hairStarEvent: function (e) {
    var index = e.currentTarget.dataset.index
    var levelList = []
    for (var i = 0; i < 5; i++) {
      if (i <= index) {
        levelList[i] = '/imgs/star_active.png'
      }
      else {
        levelList[i] = '/imgs/star_gray.png'
      }
    }
    var that = this
    that.setData({
      hairStarLevelList: levelList,
      hairMark: index + 1,
    })
  },

  shopCommentInput: function (e) {
    this.setData({
      shopComment: e.detail.value
    })
  },

  hairCommentInput: function (e) {
    this.setData({
      hairComment: e.detail.value
    })
  },

  commitEvent: function () {
    if (this.data.onCommit) {
return
    }
    if (this.data.shopComment == '') {
      wx.showModal({
        title: '提示',
        content: '请填写对理发店的评价',
        showCancel: false,
      })
      return
    }
    if (this.data.shopMark == 0) {
      wx.showModal({
        title: '提示',
        content: '请对理发店进行评分 1-5分',
        showCancel: false,
      })
      return
    }
    if (this.data.hairComment == '') {
      wx.showModal({
        title: '提示',
        content: '请填写对发型师的评价',
        showCancel: false,
      })
      return
    }
    if (this.data.hairMark == 0) {
      wx.showModal({
        title: '提示',
        content: '请对发型师进行评分 1-5分',
        showCancel: false,
      })
      return
    }
    this.setData({
      isAllCommitted: 0,
      onCommit: true,
    })
    this.commitContext(this.data.shopId, 'shop', this.data.shopComment, this.data.shopMark, this.data.orderId)
    this.commitContext(this.data.hairId, 'hairdresser', this.data.hairComment, this.data.hairMark, this.data.orderId)
  },

  commitContext: function (ownerId, ownerName, comment, mark, orderId) {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "metes/crt",
      header: {
        'content-type': 'application/json',
        'authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "comment": comment,
        "mark": mark,
        "orderId": orderId,
        "owner": {
          "id": ownerId,
          "name": ownerName,
        }
      },
      success: function (res) {
        console.log(res)
        that.setData({
          isAllCommitted: that.data.isAllCommitted + 1,
        })

        if (res.statusCode != 200) {
          wx.showModal({
            title: '提交评论失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }
        
        if (that.data.isAllCommitted == 2) {
          that.setData({
            isAllCommitted: 0,
            onCommit: false,
          })
          wx.showModal({
            title: '提示',
            content: '评论已提交',
            showCancel: false,
            success: function (res) {
              var pages = getCurrentPages();             //  获取页面栈
              var currPage = pages[pages.length - 1];    // 当前页面
              var prevPage = pages[pages.length - 2];    // 上一个页面

              
              prevPage.setData({
                currentTab: 'none',
                userInfo: {},
                appointmentList: [],
                inServiceList: [],
                completeList: [],
                evaluateList: [],
                deleteList: [],
                pageSize: 10,
                appointPage: 0,
                inservicePage: 0,
                completePage: 0,
                evaluatePage: 0,
                deletePage: 0,
                isCanloadAppoint: true,
                isCanloadInservice: true,
                isCanloadComplete: true,
                isCanloadEvaluate: true,
                isCanloadDelete: true,
                couponsList: [],
              })
              prevPage.onLoad(prevPage.data.options)

              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      }
    })
  },

})


