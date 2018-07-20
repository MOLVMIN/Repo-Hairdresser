// pages/balance/balance.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopName: '',
    itemName: '',
    hairName: '',
    couponsId: '',
    couponsName: '',
    totalPrice: 130,
    couponsPrice: -30,
    lastPrice: 0,
    onPay: false,
    inServiceOrder: {},
    couponValue: 0,
    couponNum: '',
    showCoupons:'none',
    couponsCode: '',
    couponsCodeStyle: '',
    isNormalClose: false,
    isUnload: false,
    options: {},

    remainTime: '',
    currentTime: 90
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(util.strToJson(options.inServiceOrder))
    console.log('testaa')
    console.log(options.currentTime)
    this.setData({
      shopName: options.shopName,
      itemName: options.itemName,
      hairName: options.hairName,
      inServiceOrder: util.strToJson(options.inServiceOrder),
      currentTime: options.currentTime,
      options: options
    })
    this.setData({
      lastPrice: this.data.totalPrice + this.data.couponsPrice
    })
    if (util.isNull(this.data.inServiceOrder.pay)) {
      this.setData({
        showCoupons: 'flex'
      })
    } else {
      this.setData({
        showCoupons: 'none'
      })
    }

    this.getCouponsCount()

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
        url: "orders/cancel/" + that.data.inServiceOrder.id,
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
        shopName: '',
        itemName: '',
        hairName: '',
        couponsId: '',
        couponsName: '',
        totalPrice: 130,
        couponsPrice: -30,
        lastPrice: 0,
        onPay: false,
        inServiceOrder: {},
        couponValue: 0,
        couponNum: '',
        showCoupons: 'none',
        couponsCode: '',
        couponsCodeStyle: '',
        isNormalClose: false,
        isUnload: false,
      })
      var oldOpt = that.data.options
      oldOpt.currentTime = that.data.currentTime
      that.onLoad(oldOpt)

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

  selectCouponsEvent: function () {
    let that = this
    // wx.navigateTo({
    //     url: '../../pages/coupons/coupons?isForSelect=true',
    // })
    wx.navigateTo({
      url: '../../pages/coupons/coupons?isForSelect=' + true,
    })
  },

  payEvent: function (e) {
    var that = this
    // var totalfee = 0
    // if (that.data.inServiceOrder.priceValue) {
    //   totalfee = that.data.inServiceOrder.priceValue - that.data.couponValue
    // } else {
    //   totalfee = that.data.inServiceOrder.price - that.data.couponValue
    // }
    // if (totalfee <= 0) {
    //   wx.showModal({
    //     title: '抱歉',
    //     content: '该优惠券不适用于当前订单',
    //     showCancel: false
    //   })
    //   return
    // }
    if (!that.data.onPay) {
      that.setData({
        onPay: true
      })
      var tmpUrl = ""
      console.log(that.data.couponNum)
      if (that.data.couponNum == '') {
        // this.setData({
        //   showCoupons: 'none'
        // })
        tmpUrl = "orders/pay/" + that.data.inServiceOrder.id
      } 
      else
        tmpUrl = "orders/pay/" + that.data.inServiceOrder.id + "/" + that.data.couponNum
      console.log(tmpUrl)
      var token = wx.getStorageSync('token')
      app.http.request({
        url: tmpUrl,
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        data: {},
        method: "GET",
        success: function (res) {

          if (res.statusCode != 200) {
            wx.showModal({
              title: '支付失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            console.log(res.data.reMsg)
            that.setData({
              onPay: false
            })
            return;
          }
          res.data = util.jsonOptimize(res.data)
          console.log(res.data)
          if (res.data.package == 'prepay_id=wx0000000000000000000000000000000000') {
            var appointmentDetailStr = util.jsonToStr(that.data.inServiceOrder)
            that.setData({
              onPay: false,
              isNormalClose: true,
            })
            // wx.redirectTo({
            //   url: '../../pages/appointment_detail/appointment_detail?havePaid=true&appointmentDetail=' + appointmentDetailStr,
            // })
            // 退回上个页面
            wx.navigateBack({
              delta: 1
            })
          } else {
            wx.requestPayment({
              'timeStamp': res.data.timeStamp,
              'nonceStr': res.data.nonceStr,
              'package': res.data.package, //统一下单接口返回的 prepay_id
              'signType': res.data.signType,
              'paySign': res.data.sign,
              'success': function (res) {
                console.log('requestPayment suc')
                console.log(that.data.inServiceOrder)
                var appointmentDetailStr = util.jsonToStr(that.data.inServiceOrder)
                that.setData({
                  isNormalClose: true,
                })
                // wx.redirectTo({
                //   url: '../../pages/appointment_detail/appointment_detail?havePaid=true&appointmentDetail=' + appointmentDetailStr,
                // })
                // 退回上个页面
                wx.navigateBack({
                  delta: 1
                })
              },
              'fail': function (res) {
                console.log(res);
              },
              'complete': function (res) {
                console.log('requestPayment complete');
                that.setData({
                  onPay: false
                })
              }
            })
            
          } 
        },
        fail: function (res) {
          that.setData({
            onPay: false
          })
        }
      })
    }
  },

  userCoupon: function (couponPrice) {
    let that = this
    var tmpInServiceOrder = that.data.inServiceOrder
    tmpInServiceOrder.priceValue = (parseFloat(tmpInServiceOrder.priceValue) - parseFloat(couponPrice)).toFixed(2)
    that.setData({
      inServiceOrder: tmpInServiceOrder
    })
  },

  getCouponsCount: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "coupons/list4user/99/0",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          that.setData({
            couponsCode: '无可用优惠券'
          })
          return;
        }
        res.data = util.jsonOptimize(res.data)
        if (!res.data.rows) {
          that.setData({
            couponsCode: '无可用优惠券'
          })
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
        }
        if (res.data.rows.length > 0) {
          that.setData({
            couponsCode: '请选择优惠券',
            couponsCodeStyle: 'color:red'
          })
        } else {
          that.setData({
            couponsCode: '无可用优惠券'
          })
        }
      },
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
      if (that.data.onPay == false) {
        currentTime--;
      }
      if (currentTime < 0) {
        return
      }
      that.setData({
        remainTime: currentTime + '秒',
        currentTime: currentTime,
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        // that.setData({
        //   // time: '支付超时',
        //   // currentTime: 61,
        //   // disabled: false
        // })

        console.log('balance_overtime')

        if (that.data.isUnload == true) {
          return
        }

        // 请求预约失效
        var token = wx.getStorageSync('token')
        app.http.request({
          url: "orders/cancel/" + that.data.inServiceOrder.id,
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