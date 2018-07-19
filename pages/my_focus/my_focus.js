// pages/my_focus/my_focus.js
var util = require('../../utils/util.js')
var app = getApp()
var request = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    storeList: [],
    hairdresserList: [],
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      options: options
    })
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getMyFocusHairdressers()
        that.getMyFocusStore()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getMyFocusHairdressers()
        that.getMyFocusStore()
      }
    }
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
        currentTab: 0,
        storeList: [],
        hairdresserList: [],
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

  /** 
 * 滑动切换tab 
 */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });

    that.getCurrentScoreList(that.data.currentTab)
  },

  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  // 取消关注理发店
  ctStoreEvent: function (e) {
    var that = this
    console.log(e)
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/ct/" + e.currentTarget.dataset.id,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      data: {

      },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '取关理发店失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        that.getMyFocusStore()
      }
    })
  },

  // 取消关注发型师
  ctHairdressersEvent: function (e) {
    var that = this
    console.log(e)
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/ct/" + e.currentTarget.dataset.id,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      data: {

      },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '取关发型师失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        that.getMyFocusHairdressers()
      }
    })
  },

  // 获取已关注的发型师
  getMyFocusHairdressers: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "/hairdressers/at/list",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "page": 0,
        "search": "",
        "size": 99,
        "sortNames": [
          "id"
        ],
        "sortOrders": [
          "ASC"
        ]
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取已关注发型师列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        for (var i in res.data.rows) {
          res.data.rows[i].imageId = request.host + "/images/f/" + res.data.rows[i].imageId
        }
        that.setData({
          hairdresserList: res.data.rows
        })
      }
    })
  },

  // 获取已关注的理发店列表
  getMyFocusStore: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "/shops/at/list",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "page": 0,
        "search": "",
        "size": 99,
        "sortNames": [
          "id"
        ],
        "sortOrders": [
          "ASC"
        ]
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取已关注理发店列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        // for (var i = 0; i < res.data.rows.length; i++) {
        //     res.data.rows[i].imageId = request.host + "/images/f/" + res.data.rows[i].imageId
        // }
        that.setData({
          storeList: res.data.rows
        })
      }
    })
  },

  gotoStore: function (e) {
    console.log('gotoStore')
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../../pages/store_detail/store_detail?id=' + e.currentTarget.dataset.id
    })
  },

  gotoHairdresser: function (e) {
    console.log('gotoHairdresser')
    wx.navigateTo({
      url: '../../pages/hair_detail/hair_detail?id=' + e.currentTarget.dataset.id
    })
  }
})