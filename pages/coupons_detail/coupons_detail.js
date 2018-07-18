// pages/coupons_detail/coupons_detail.js
var app = getApp()
var util = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isForSelect: false,
    id: '',
    conditions: '',
    selectStyle: '',
    detailInfo: [],
    couponDetail: {},
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var detail = util.strToJson(options.couponDetail)
    if (detail.itemNames) {
      detail.itemNameList = ''
      for (var i in detail.itemNames) {
        detail.itemNameList = detail.itemNameList + detail.itemNames[i] + ','
      }
      detail.itemNameList = detail.itemNameList.substring(0, detail.itemNameList.length - 1)
    }
    if (detail.shopNames) {
      detail.shopNameList = ''
      for (var i in detail.shopNames) {
        detail.shopNameList = detail.shopNameList + detail.shopNames[i] + ','
      }
      detail.shopNameList = detail.shopNameList.substring(0, detail.shopNameList.length - 1)
    }
    console.log(detail)
    this.setData({
        isForSelect: options.isForSelect,
        couponDetail: detail,
        options: options
    })
    var isSelect = this.data.isForSelect
    console.log(isSelect)
    if (isSelect == 'true') {
      console.log('1')
      this.setData({
        selectStyle: 'display:block'
      })
    }
    else {
      console.log('2')
      this.setData({
        selectStyle: 'display:none'
      })
    }
    console.log(this.data.selectStyle)
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
        isForSelect: false,
        id: '',
        conditions: '',
        selectStyle: '',
        detailInfo: [],
        couponDetail: {},
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

  selectCouponsEvent : function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 3];  // 结账页面
    // 直接调用上级页面的setData()方法，把数据存到上级页面中去
    prevPage.setData({
      couponsId: this.data.id,
      couponsName: this.data.couponDetail.name,
      couponValue: this.data.couponDetail.price,
      couponNum: this.data.couponDetail.couponnum,
      couponsCode: this.data.couponDetail.couponnum,
    })

    wx.navigateBack({
      delta: 2
    })
  },

})