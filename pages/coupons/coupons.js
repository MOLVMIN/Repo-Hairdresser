// pages/coupons/coupons.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isForSelect: false,
    couponsList: [],
    options: {},
    showNoselect: 'none'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isForSelect: options.isForSelect,
      //couponsList: util.strToJson(options.couponsList)
      options: options,
    })
    console.log(this.data.isForSelect)
    if (this.data.isForSelect == 'true') {
      this.setData({
        showNoselect: 'flex'
      })
    }
    console.log(this.data.couponsList)
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getCouponsList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getCouponsList()
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
        isForSelect: false,
        couponsList: [],
        showNoselect: 'none'
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


  couponsDetailEvent: function (e) {
    var strCouponDetail = util.jsonToStr(e.currentTarget.dataset.coupondetail)
    console.log(strCouponDetail)
    wx.navigateTo({
      url: '../../pages/coupons_detail/coupons_detail?isForSelect=' + this.data.isForSelect + '&couponDetail=' + strCouponDetail
    })
  },



  getCouponsList: function () {
    var that = this
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "coupons/list4user/99/0",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        wx.hideLoading()
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取优惠券列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }
        res.data = util.jsonOptimize(res.data)
        if (!res.data.rows) {
          return
        }
        for (var i = res.data.rows.length - 1; i >= 0; i--) {
          if (res.data.rows[i].status != 'NORMAL') {
            res.data.rows.splice(i, 1)
            continue
          }
          
          if (res.data.rows[i].deadline) {
            var now = util.getNowFormatDate()
            var timeout = util.compareCalendar(res.data.rows[i].deadline, now)
            if (timeout) {
              res.data.rows.splice(i, 1)
              continue
            }
          } else {
            res.data.rows.splice(i, 1)
            continue
          }

          if (res.data.rows[i].status == 'NORMAL') {
            res.data.rows[i].couponsRightClass = 'coupons-right'
            res.data.rows[i].couponsRightText = '查看详情'
            res.data.rows[i].couponsLeftImage = '/imgs/voucher_active.png'
            res.data.rows[i].bindtapEvent = 'couponsDetailEvent'
          }
          else {
            res.data.rows[i].couponsRightClass = 'coupons-right-gray'
            res.data.rows[i].couponsRightText = '已过期'
            res.data.rows[i].couponsLeftImage = '/imgs/voucher_gray.png'
            res.data.rows[i].bindtapEvent = ''
          }
          res.data.rows[i].couponsTime = res.data.rows[i].deadline.substring(0, 10)
        }
        that.setData({
          couponsList: res.data.rows
        })
        console.log(that.data.couponsList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  }, 

  noselectbtn: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  // 结账页面
    // 直接调用上级页面的setData()方法，把数据存到上级页面中去
    prevPage.setData({
      couponsId: '',
      couponsName: '',
      couponValue: 0,
      couponNum: '',
      couponsCode: '',
    })

    wx.navigateBack({
      delta: 1
    })
  }, 
})