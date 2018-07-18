// pages/activity_detail/activity_detail.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponsObj : null,
    imageId: undefined,
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tmpObj = util.strToJson(options.couponsJson)
    tmpObj.shopNameList = ''
    for (var i in tmpObj.shopNames) {
      tmpObj.shopNameList = tmpObj.shopNameList + tmpObj.shopNames[i] + "，"
    }
    if (tmpObj.shopNameList) {
      tmpObj.shopNameList = tmpObj.shopNameList.substring(0, tmpObj.shopNameList.length - 1)
    }
    tmpObj.itemNameList = ''
    for (var i in tmpObj.itemNames) {
      tmpObj.itemNameList = tmpObj.itemNameList + tmpObj.itemNames[i] + "，"
    }
    if (tmpObj.itemNameList) {
      tmpObj.itemNameList = tmpObj.itemNameList.substring(0, tmpObj.itemNameList.length - 1)
    }
    if (tmpObj.price == undefined) {
      tmpObj.price = 0
    }
    this.setData({
      couponsObj: tmpObj,
      imageId: tmpObj.imageIds[0],
      options: options
    })
    console.log(this.data.couponsObj)

    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
    }
    else {
      app.refreshTokenInfo()
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
        couponsObj: null,
        imageId: undefined,
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    console.log(this.data.options.couponsJson)
    return {
      title: '胡头理连锁优惠活动',
      path: '/pages/activity_detail/activity_detail?couponsJson=' + this.data.options.couponsJson,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  getCoupon: function (e) {
    let that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "activitys/get/" + e.currentTarget.dataset.id,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          if (res.data.reMsg.indexOf("此优惠活动已无优惠券可领取") > -1) {
            wx.showToast({
              title: '无多余优惠券',
              image: '/imgs/error.png'
            })
            var tmpObj = that.data.couponsObj
            tmpObj.remainder = 0
            that.setData({
              couponsObj: tmpObj
            })
          } else {
            wx.showModal({
              title: '领取失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            // wx.showToast({
            //   title: '领取失败',
            //   image: '/imgs/error.png'
            // })
          }
          
          return
        }
        wx.showToast({
          title: '领取成功',
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '领取失败',
        })
      }
    })
  }
})