// pages/appointment_detail/appointment_detail.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appointmentDetail: {},
    onPay: false,
    havePaid: false,
    isNormalClose: false,
    isUnload: false,
    options: {},

    remainTime: '',
    currentTime: 90,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.appointmentDetail)
    console.log(options.havePaid)
    if (options.havePaid == 'true') {
      this.setData({
        havePaid: true
      })
    }
    else {
      this.setData({
        havePaid: false
      })
    }
    this.setData({
      options: options
    })

    var appointmentDetailJson = util.strToJson(options.appointmentDetail)
    appointmentDetailJson.imagePath = app.http.host + 'images/f/' + appointmentDetailJson.imageId
    this.setData({
      appointmentDetail: appointmentDetailJson
    })

    this.count_down()
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
    var that = this
    that.setData({
      isUnload: true
    })
    if (that.data.isNormalClose == false) {
      var token = wx.getStorageSync('token')
      app.http.request({
        url: "orders/cancel/" + that.data.appointmentDetail.id,
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        data: {},
        method: "DELETE",
      })
    }
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
        appointmentDetail: {},
        onPay: false,
        havePaid: false,
        isNormalClose: false,
        isUnload: false,
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

  payAppointment: function () {
    var that = this
    if (!that.data.onPay) {
      that.setData({
        onPay: true
      })
      console.log(that.data.inServiceOrder)
      var token = wx.getStorageSync('token')
      app.http.request({
        url: "orders/pay/" + that.data.inServiceOrder.id,
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        data: {},
        method: "GET",
        success: function (res) {
          console.log(res)
          if (res.statusCode != 200) {
            wx.showModal({
              title: '支付失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            return;
          }
          res.data = util.jsonOptimize(res.data)
          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package, //统一下单接口返回的 prepay_id
            'signType': res.data.signType,
            'paySign': res.data.sign,
            'success': function (res) {
              console.log('requestPayment suc');
            },
            'fail': function (res) {
              console.log('requestPayment fail');
            },
            'complete': function (res) {
              console.log('requestPayment complete');
            }
          })
          that.setData({
            onPay: false
          })
        },
        fail: function (res) {
          that.setData({
            onPay: false
          })
        }
      })
    }
  },

  balanceTapEvent: function (e) {
    console.log(e.currentTarget.dataset.item)
    var inServiceStr = util.jsonToStr(e.currentTarget.dataset.item)
    this.setData({
      isNormalClose: true,
    })
    wx.redirectTo({
      url: '../../pages/balance/balance?inServiceOrder=' + inServiceStr + '&currentTime=' + this.data.currentTime
    })
  }, 

  ownerInfoTapEvent: function () {
    console.log('a')
    wx.navigateBack({
      delta: 3
    })
    wx.switchTab({
      url: '/pages/my/my',
    })
  },

  /* 毫秒级倒计时 */
  count_down: function () {
    var that = this
    var currentTime = that.data.currentTime
    that.setData({
      remainTime: currentTime + '秒',
      currentTime: currentTime,
    })
    var interval = setInterval(function () {
      currentTime--;
      if (currentTime < 0) {
        return
      }
      that.setData({
        remainTime: currentTime + '秒',
        currentTime: currentTime,
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        console.log('appointment_detail_overtime')
        // that.setData({
        //   // time: '支付超时',
        //   // currentTime: 61,
        //   // disabled: false
        // })
        if (that.data.isUnload == true) {
          return
        }

        // 请求预约失效
        var token = wx.getStorageSync('token')
        app.http.request({
          url: "orders/cancel/" + that.data.appointmentDetail.id,
          header: {
            'content-type': 'application/json',
            'Authorization': "Bearer " + token,
          },
          data: {},
          method: "DELETE",
          success: function (res) {
          },
          fail: function (res) {
          },
          complete: function () {
            wx.showModal({
              title: '支付超时',
              content: '请重新预约',
              showCancel: false,
              success: function (res) {
                that.setData({
                  isNormalClose: true,
                })
                // 退回上个页面
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          },
        })

      }
    }, 1000)
  },
})