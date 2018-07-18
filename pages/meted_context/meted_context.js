// pages/meted_context/meted_context.js
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
    shopComment: '该订单没有进行评论',
    hairComment: '该订单没有进行评论',

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
      options: options
    })

    this.getEvaluate()
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
        shopComment: '该订单没有进行评论',
        hairComment: '该订单没有进行评论',
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

  getEvaluate: function () {
    var that = this;
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    console.log(this.data.orderId)
    app.http.request({
      url: "metes/client/order/" + this.data.orderId + "/10/0",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        console.log(res)
        if (res.statusCode != 200) {
          return
        }
        if (!res.data.rows || res.data.rows.length == 0) {
          return
        }
        res.data = util.jsonOptimize(res.data)
        for (var i in res.data.rows) {
          var storeid = res.data.rows[i].shopId
          var hairid = res.data.rows[i].hairdresserId
          if (storeid) {
            // 分数
            var mark = res.data.rows[i].mark - 1
            var levelList = []
            for (var j = 0; j < 5; j++) {
              if (j <= mark) {
                levelList[j] = '/imgs/star_active.png'
              }
              else {
                levelList[j] = '/imgs/star_gray.png'
              }
            }
            that.setData({
              shopStarLevelList: levelList,
              shopMark: mark + 1,
            })
// 评论
            that.setData({
              shopComment: res.data.rows[i].comment
            })
            continue
          }
          if (hairid) {
            // 分数
            var mark = res.data.rows[i].mark - 1
            var levelList = []
            for (var j = 0; j < 5; j++) {
              if (j <= mark) {
                levelList[j] = '/imgs/star_active.png'
              }
              else {
                levelList[j] = '/imgs/star_gray.png'
              }
            }
            that.setData({
              hairStarLevelList: levelList,
              hairMark: mark + 1,
            })
            // 评论
            that.setData({
              hairComment: res.data.rows[i].comment
            })
            continue
          }
        }
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

})


