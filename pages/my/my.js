// pages/my/my.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
        that.getUserInfo()
        that.appointmentTapEvent()
        that.getCouponsList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getUserInfo()
        that.appointmentTapEvent()
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
    if (this.data.currentTab == 'appointment') {
      if (this.data.isCanloadAppoint == true) {
        this.setData({
          appointPage: this.data.appointPage + 1
        })
        this.getAppointmentList()
      }
    } else if (this.data.currentTab == 'in_service') {
      if (this.data.isCanloadInservice == true) {
        this.setData({
          inservicePage: this.data.inservicePage + 1
        })
        this.getInServiceList()
      }
    } else if (this.data.currentTab == 'complete') {
      if (this.data.isCanloadComplete == true) {
        this.setData({
          completePage: this.data.completePage + 1
        })
        this.getCompleteList()
      }
    } else if (this.data.currentTab == 'evaluate') {
      if (this.data.isCanloadEvaluate == true) {
        this.setData({
          evaluatePage: this.data.evaluatePage + 1
        })
        this.getEvaluateList()
      }
    } else if (this.data.currentTab == 'delete') {
      if (this.data.isCanloadDelete == true) {
        this.setData({
          deletePage: this.data.deletePage + 1
        })
        this.getDeleteList()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getUserInfo: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  payEvent: function (e) {
    var appid = "wxc71c4fcdedf1c22f"
    var timestamp = Date.parse(new Date) / 1000
    console.log(timestamp)
    var nonceStr = Math.random().toString(36).substr(2, 15)
    console.log(nonceStr)

    var stringA = "appid=" + appid + "&body=test&device_info=1000&mch_id=10000100&nonce_str=" + nonceStr;
    var stringSignTemp = stringA + "&key=192006250b4c09247ec02edce69f6a2d" //注：key为商户平台设置的密钥key

    var md5util = require("../MD5/md5.js");
    var sign = md5util.hexMD5(stringSignTemp).toUpperCase() //注：MD5签名方式

    wx.requestPayment({
      'timeStamp': timestamp.toString(),
      'nonceStr': nonceStr,
      'package': 'wx2017033010242291fcfe0db70013231072',
      'signType': 'MD5',
      'paySign': sign,
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
  },

  appointmentItemEvent: function (e) {
    let that = this
    console.log(e)
    var tmpList = that.data.appointmentList
    tmpList[e.currentTarget.dataset.index].status = !tmpList[e.currentTarget.dataset.index].status
    that.setData({
      appointmentList: tmpList
    })
  },

  appointmentTapEvent: function (e) {
    this.setData({
      appointmentList: [],
      appointPage: 0
    })
    this.getAppointmentList()
  },

  getAppointmentList: function () {
    var that = this
    that.setData({
      currentTab: 'appointment'
    })
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    console.log("orders/maked/" + that.data.pageSize + "/" + that.data.appointPage)
    app.http.request({
      url: "orders/maked/" + that.data.pageSize + "/" + that.data.appointPage,
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
          that.setData({
            isCanloadAppoint: false
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var cTimestamp = Date.parse(new Date())
        console.log(cTimestamp)
        for (var i in res.data.rows) {
          //res.data.rows[i].orderTime = res.data.rows[i].createdate.substring(0, 10)
          res.data.rows[i].arrvilTime = res.data.rows[i].mkTime.substring(0, 10)

          res.data.rows[i].imagePath = app.http.host + 'images/f/' + res.data.rows[i].hairdresserImageId
          res.data.rows[i].itemlist = ""
          for (var j in res.data.rows[i].itemNames) {
            res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
          }
          res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
          res.data.rows[i].newphone = res.data.rows[i].phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        }
        var tmpAppointmentList = res.data.rows
        for (var i in tmpAppointmentList) {
          tmpAppointmentList[i].status = false
        }
        that.setData({
          appointmentList: that.data.appointmentList.concat(tmpAppointmentList),
        })
        console.log(that.data.appointmentList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  in_serviceTapEvent: function (e) {
    this.setData({
      inServiceList: [],
      inservicePage: 0
    })
    this.getInServiceList()
  },

  getInServiceList: function () {
    this.setData({
      currentTab: 'in_service'
    })
    var that = this;
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    console.log("orders/servering/" + that.data.pageSize + "/" + that.data.inservicePage)
    app.http.request({
      url: "orders/servering/" + that.data.pageSize + "/" + that.data.inservicePage,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.statusCode != 200) {
          return
        }
        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanloadInservice: false
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var cTimestamp = Date.parse(new Date())
        console.log(cTimestamp)
        for (var i in res.data.rows) {
          // res.data.rows[i].orderTime = res.data.rows[i].createdate.substring(0, 10)
          res.data.rows[i].arrvilTime = res.data.rows[i].mkTime.substring(0, 10)

          res.data.rows[i].imagePath = app.http.host + 'images/f/' + res.data.rows[i].hairdresserImageId
          res.data.rows[i].itemlist = ""
          for (var j in res.data.rows[i].itemNames) {
            res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
          }
          res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
        }
        that.setData({
          inServiceList: that.data.inServiceList.concat(res.data.rows),
        })
        console.log(that.data.inServiceList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  completeTapEvent: function (e) {
    this.setData({
      completeList: [],
      completePage: 0
    })
    this.getCompleteList()
  },

  getCompleteList: function () {
    this.setData({
      currentTab: 'complete'
    })
    var that = this;
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "orders/paid/" + that.data.pageSize + "/" + that.data.completePage,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.statusCode != 200) {
          return
        }
        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanloadComplete: false
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        for (var i in res.data.rows) {
          //res.data.rows[i].orderTime = res.data.rows[i].createdate.substring(0, 10)
          res.data.rows[i].arrvilTime = res.data.rows[i].mkTime.substring(0, 10)
          res.data.rows[i].imagePath = app.http.host + 'images/f/' + res.data.rows[i].hairdresserImageId

          res.data.rows[i].itemlist = ""
          for (var j in res.data.rows[i].itemNames) {
            res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
          }
          res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
          res.data.rows[i].lastprice = res.data.rows[i].price - res.data.rows[i].couponValue
          res.data.rows[i].newphone = res.data.rows[i].phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        }
        that.setData({
          completeList: that.data.completeList.concat(res.data.rows),
        })
        console.log(that.data.completeList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  evaluateTapEvent: function (e) {
    this.setData({
      evaluateList: [],
      evaluatePage: 0
    })
    this.getEvaluateList()
  },

  getEvaluateList: function () {
    this.setData({
      currentTab: 'evaluate'
    })
    var that = this;
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "orders/meted/" + that.data.pageSize + "/" + that.data.evaluatePage,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.statusCode != 200) {
          return
        }
        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanloadEvaluate: false
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        for (var i in res.data.rows) {
          res.data.rows[i].imagePath = app.http.host + 'images/f/' + res.data.rows[i].hairdresserImageId
          res.data.rows[i].arrvilTime = res.data.rows[i].mkTime.substring(0, 10)

          res.data.rows[i].itemlist = ""
          for (var j in res.data.rows[i].itemNames) {
            res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
          }
          res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
          res.data.rows[i].lastprice = res.data.rows[i].price - res.data.rows[i].couponValue
          res.data.rows[i].newphone = res.data.rows[i].phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        }
        that.setData({
          evaluateList: that.data.evaluateList.concat(res.data.rows),
        })
        console.log(that.data.evaluateList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  deleteTapEvent: function (e) {
    this.setData({
      deleteList: [],
      deletePage: 0
    })
    this.getDeleteList()
  },

  getDeleteList: function () {
    this.setData({
      currentTab: 'delete'
    })
    var that = this;
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "orders/cancel/making/" + that.data.pageSize + "/" + that.data.deletePage,
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
          that.setData({
            isCanloadDelete: false
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        for (var i in res.data.rows) {
          //res.data.rows[i].orderTime = res.data.rows[i].createdate.substring(0, 10)
          res.data.rows[i].arrvilTime = res.data.rows[i].mkTime.substring(0, 10)
          res.data.rows[i].imagePath = app.http.host + 'images/f/' + res.data.rows[i].hairdresserImageId
          res.data.rows[i].itemlist = ""
          for (var j in res.data.rows[i].itemNames) {
            res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
          }
          res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
        }
        that.setData({
          deleteList: that.data.deleteList.concat(res.data.rows),
        })
        console.log(that.data.deleteList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  evaluateContextTapEvent: function (e) {
    console.log(e.currentTarget.dataset.orderid)
    console.log(e.currentTarget.dataset.shopid)
    console.log(e.currentTarget.dataset.shopname)
    console.log(e.currentTarget.dataset.hairid)
    console.log(e.currentTarget.dataset.hairname)
    console.log(e.currentTarget.dataset.hairdresserimageid)
    wx.navigateTo({
      url: '../../pages/evaluate_context/evaluate_context?shopId=' + e.currentTarget.dataset.shopid + '&shopName=' + e.currentTarget.dataset.shopname + '&hairId=' + e.currentTarget.dataset.hairid + '&hairName=' + e.currentTarget.dataset.hairname + '&hairImageId=' + e.currentTarget.dataset.hairdresserimageid + '&orderId=' + e.currentTarget.dataset.orderid
    })
  },

  metedContextTapEvent : function (e) {
    wx.navigateTo({
      url: '../../pages/meted_context/meted_context?shopId=' + e.currentTarget.dataset.shopid + '&shopName=' + e.currentTarget.dataset.shopname + '&hairId=' + e.currentTarget.dataset.hairid + '&hairName=' + e.currentTarget.dataset.hairname + '&hairImageId=' + e.currentTarget.dataset.hairdresserimageid + '&orderId=' + e.currentTarget.dataset.orderid
    })
  },

  couponsTapEvent: function (e) {
    var couponsListStr = util.jsonToStr(this.data.couponsList)
    wx.navigateTo({
      url: '../../pages/coupons/coupons?isForSelect=false&couponsList=' + couponsListStr
    })
  },

  balanceTapEvent: function (e) {
    console.log(e.currentTarget.dataset.item)
    var inServiceStr = util.jsonToStr(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: '../../pages/balance/balance?inServiceOrder=' + inServiceStr
    })
  },

  cancleAppointmentEvent: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '是否取消订单',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          var token = wx.getStorageSync('token')
          app.http.request({
            url: "orders/cancel/" + orderId,
            header: {
              'content-type': 'application/json',
              'Authorization': "Bearer " + token,
            },
            method: "DELETE",
            success: function (res) {
              console.log(res)

              if (res.statusCode != 200) {
                console.log("取消订单失败")
                wx.showModal({
                  title: '取消订单失败',
                  content: util.checkMsg(res.data.reMsg),
                  showCancel: false,
                })
                return
              }

              that.setData({
                appointmentList: [],
                isCanloadAppoint: true,
                appointPage: 0
              })
              that.appointmentTapEvent()
            }
          })
        }
      }
    })
  },

  evaluateDeleteTapEvent: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id
    console.log(orderId)
    wx.showModal({
      title: '提示',
      content: '是否删除待评论订单',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          var token = wx.getStorageSync('token')
          app.http.request({
            url: "orders/nomete/" + orderId,
            header: {
              'content-type': 'application/json',
              'Authorization': "Bearer " + token,
            },
            method: "DELETE",
            success: function (res) {
              console.log(res)

              if (res.statusCode != 200) {
                console.log("删除待评论订单失败")
                wx.showModal({
                  title: '删除待评论订单失败',
                  content: util.checkMsg(res.data.reMsg),
                  showCancel: false,
                })
                return
              }

              that.setData({
                evaluateList: [],
                isCanloadEvaluate: true,
                evaluatePage: 0
              })
              that.evaluateTapEvent()
            }
          })
        }
      }
    })
  },

  completeOrderDeleteTapEvent: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '是否删除订单',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          var token = wx.getStorageSync('token')
          app.http.request({
            url: "orders/" + orderId,
            header: {
              'content-type': 'application/json',
              'Authorization': "Bearer " + token,
            },
            method: "DELETE",
            success: function (res) {
              console.log(res)

              that.setData({
                completeList: [],
                isCanloadComplete: true,
                completePage: 0
              })
              that.completeTapEvent()
            }
          })
        }
      }
    })
  },

  cancleOrderDeleteTapEvent: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '是否删除订单',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          var token = wx.getStorageSync('token')
          app.http.request({
            url: "orders/" + orderId,
            header: {
              'content-type': 'application/json',
              'Authorization': "Bearer " + token,
            },
            method: "DELETE",
            success: function (res) {
              console.log(res)

              that.setData({
                deleteList: [],
                isCanloadDelete: true,
                deletePage: 0
              })
              that.deleteTapEvent()
            }
          })
        }
      }
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
          console.log("获取优惠券列表失败")
          wx.showModal({
            title: '获取优惠券列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
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

  myFocus: function () {
    wx.navigateTo({
      url: '/pages/my_focus/my_focus',
    })
  }

})