// pages/order/order.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hairId: '',
    hairName: '',
    shopId: '',
    shopName: '',
    memo: '',
    itemArray: [],
    itemArrayName: [],
    itemIds: [],
    index: 0,
    date: '',
    time: '',
    items: [],
    itemShow: true,
    orderPrice: 0,
    appointmentDate: 0,
    appointmentTime: 0,
    appointmentList: [],
    phone: false,
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var myDate = new Date()
    var mydate = util.formatDate(myDate)
    var mytime = util.formatTime(myDate)
    console.log(util.formatDate(myDate) + " " + util.formatTime(myDate))
    this.setData({
      hairId: options.hairId,
      hairName: options.hairName,
      shopId: options.shopId,
      shopName: options.shopName,
      memo: options.memo,
      // date: mydate,
      // time: mytime
      options: options
    })

    // this.getItem()
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getItemPrice()
        that.getTimeList()
        that.getPhone()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getItemPrice()
        that.getTimeList()
        that.getPhone()
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
        hairId: '',
        hairName: '',
        shopId: '',
        shopName: '',
        itemArray: [],
        itemArrayName: [],
        itemIds: [],
        index: 0,
        date: '',
        time: '',
        items: [],
        itemShow: true,
        orderPrice: 0,
        appointmentDate: 0,
        appointmentTime: 0,
        appointmentList: [],
        phone: false,
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

  bindPickerChange: function (e) {
    var that = this
    this.setData({
      index: e.detail.value,
      itemId: that.data.itemArray[e.detail.value].id
    })
    console.log(that.data.itemArray[e.detail.value].id)
  },

  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    }),
      this.pickTimeEvent()
  },

  pickTimeEvent: function () {

  },

  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },


  // commitOrderEvent: function () {
  //   console.log(this.data)
  //   var that = this
  //   if (that.data.orderPrice <= 0 || that.data.itemIds.length <= 0) {
  //     wx.showModal({
  //       title: '提示',
  //       content: '请先选择预约项目',
  //       showCancel: false
  //     })
  //     return
  //   }

  //   if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
  //     wx.showModal({
  //       title: '提示',
  //       showCancel: false,
  //       content: '下单失败，需用户授权手机号',
  //     })
  //     return
  //   } else {
  //     app.http.request({
  //       url: "orders/mader",
  //       header: {
  //         'content-type': 'application/json',
  //         'authorization': "Bearer " + app.globalData.token,
  //       },
  //       method: "POST",
  //       data: {
  //         // "createdate": "2017-12-09 12:35:11",
  //         "hairdressId": this.data.hairId,
  //         // "hairdressName": this.data.hairName,
  //         "itemIds": this.data.itemIds,
  //         // "itemNames": this.data.itemArray[this.data.index].name,
  //         "mkTime": this.data.date + " " + this.data.time + ":00",
  //         // "phone": "15816140011",
  //         // "price": this.data.orderPrice,
  //         // "shopId": this.data.shopId,
  //         // "shopName": this.data.shopName
  //       },
  //       success: function (res) {
  //         console.log(res)
  //         var appointmentDetailStr = util.jsonToStr(res.data)
  //         console.log(appointmentDetailStr)
  //         wx.showModal({
  //           title: '提示',
  //           content: '订单已提交',
  //           showCancel: false,
  //           success: function (res) {
  //             wx.navigateTo({
  //               url: '/pages/appointment_detail/appointment_detail?appointmentDetail=' + appointmentDetailStr,
  //             })
  //           }
  //         })
  //       }
  //     })
  //   }
  // },

  /**
  * 弹窗
  */
  commitEvent: function (e) {
    let that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        content: '请授权绑定手机号才可下单',
        showCancel: false
      })
      return
    }

    if (that.data.date == "" || that.data.time == "") {
      wx.showModal({
        title: '提示',
        content: '请选择预约时间',
        showCancel: false
      })
      return
    }

    if (that.data.orderPrice <= 0 || that.data.itemIds.length <= 0) {
      wx.showModal({
        title: '提示',
        content: '请先选择预约项目',
        showCancel: false
      })
      return
    }

    var token = wx.getStorageSync('token')
    app.http.request({
      url: "users/wx",
      header: {
        'content-type': 'application/json',
        'authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "encData": e.detail.encryptedData,
        "iv": e.detail.iv,
      },
      success: function (res) {
        wx.setStorage({
          key: 'phone',
          data: true,
        })
        console.log(res)
        if (res.statusCode == 200) {
          console.log(that.data.hairId)
          console.log(that.data.itemIds)
          console.log(that.data.date + " " + that.data.time + ":00")
          app.http.request({
            url: "orders/mader",
            header: {
              'content-type': 'application/json',
              'authorization': "Bearer " + token,
            },
            method: "POST",
            data: {
              "hairdressId": that.data.hairId,
              "itemIds": that.data.itemIds,
              "mkTime": that.data.date + " " + that.data.time + ":00"
            },
            success: function (res) {
              console.log(res)
              if (res.statusCode != 200) {
                wx.showModal({
                  title: '下单失败',
                  content: util.checkMsg(res.data.reMsg),
                  showCancel: false,
                })
                return
              }
              res.data = util.jsonOptimize(res.data)
              var appointmentDetailStr = util.jsonToStr(res.data)
              console.log(appointmentDetailStr)
              wx.redirectTo({
                url: '/pages/appointment_detail/appointment_detail?appointmentDetail=' + appointmentDetailStr,
              })
            }
          })
        } else {
          wx.showModal({
            title: '用户手机号信息更新失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
        }
      },
      fail: function (res) {

      },
    })

  },

  commitEventView: function () {
    let that = this

    console.log(that.data.date)
    console.log(that.data.time)
    if (that.data.date == "" || that.data.time == "") {
      wx.showModal({
        title: '提示',
        content: '请选择预约时间',
        showCancel: false
      })
      return
    }

    if (that.data.orderPrice <= 0 || that.data.itemIds.length <= 0) {
      wx.showModal({
        title: '提示',
        content: '请先选择预约项目',
        showCancel: false
      })
      return
    }

    console.log(that.data.hairId)
    console.log(that.data.itemIds)
    console.log(that.data.date + " " + that.data.time + ":00")
    
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "orders/mader",
      header: {
        'content-type': 'application/json',
        'authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "hairdressId": that.data.hairId,
        "itemIds": that.data.itemIds,
        "mkTime": that.data.date + " " + that.data.time + ":00",
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          var omsg = util.checkMsg(res.data.reMsg)
          if (omsg == '无效预约时间，当前发型师无法提供该时间点的预约' || 
            omsg == '无效预约时间,当前发型师无法提供该时间点的预约') {
            omsg = '该预约时间已被其他用户占用，请选择其他时间段'
          } 
          wx.showModal({
            title: '下单失败',
            content: omsg,
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var appointmentDetailStr = util.jsonToStr(res.data)
        console.log(appointmentDetailStr)
        wx.redirectTo({
          url: '/pages/appointment_detail/appointment_detail?appointmentDetail=' + appointmentDetailStr,
        })
      }
    })
  },

  getPhone: function () {
    var that = this
    wx.getStorage({
      key: 'phone',
      success: function (res) {
        console.log(res)
        if (res.data) {
          that.setData({
            phone: true
          })
        }
      }
    })
  },


  getItem: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "items/list",
      header: {
        'content-type': 'application/json',
        'authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "page": 0,
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
            title: '获取发型师项目列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var array = []
        for (var i in res.data.rows) {
          array.push({ "name": res.data.rows[i].id, "value": res.data.rows[i].name, "checked": false })
        }
        that.setData({
          // itemArray: res.data.rows,
          // itemArrayName: array,
          // itemId: res.data.rows[0].id
          items: array
        })
        console.log(that.data.items)
      }
    })
  },

  getItemPrice: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "prices/list/" + that.data.hairId,
      header: {
        'content-type': 'application/json',
        'authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "page": 0,
        "size": 99,
        "search": "",
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
            title: '获取发型师项目价格列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var array = []
        for (var i in res.data.rows) {
          array.push({ "text": res.data.rows[i].name, "id": res.data.rows[i].itemId, price: res.data.rows[i].price, "checked": false })
        }
        console.log(array)
        that.setData({
          items: array
        })
      }
    })
  },

  checkboxChange: function (e) {
    this.setData({
      itemIds: e.detail.value
    })
    console.log(this.data.itemIds)
  },

  itemEvent: function () {
    this.setData({
      itemShow: !this.data.itemShow
    })
  },

  itemCheckedEvent: function (e) {
    let that = this
    var tmpItems = that.data.items
    console.log(e)
    for (var i in that.data.items) {
      if (e.currentTarget.dataset.id == that.data.items[i].id) {
        tmpItems[i].checked = !e.currentTarget.dataset.checked
        var tmpPrice = 0
        if (tmpItems[i].checked) {
          tmpPrice = (parseFloat(that.data.orderPrice) + parseFloat(tmpItems[i].price)).toFixed(2)
        }
        else {
          tmpPrice = (parseFloat(that.data.orderPrice) - parseFloat(tmpItems[i].price)).toFixed(2)
        }
        that.setData({
          orderPrice: tmpPrice
        })
      }
    }
    var tmpItemIds = []
    for (var i in that.data.items) {
      if (that.data.items[i].checked)
        tmpItemIds.push(that.data.items[i].id)
    }
    that.setData({
      items: tmpItems,
      itemIds: tmpItemIds
    })
    console.log(tmpItemIds)
    console.log(that.data.itemIds)
  },

  appointmentDateEvent: function (e) {
    var that = this
    that.setData({
      appointmentDate: e.currentTarget.dataset.index,
      date: that.data.appointmentList[e.currentTarget.dataset.index].date
    })
  },
  appointmentTimeEvent: function (e) {
    var tmpAppointmentList = this.data.appointmentList
    var tmpTime = ""
    for (var i in tmpAppointmentList) {
      for (var j in tmpAppointmentList[i].times) {
        tmpAppointmentList[i].times[j].isChecked = false
      }
    }
    tmpAppointmentList[this.data.appointmentDate].times[e.currentTarget.dataset.index].isChecked = true
    tmpTime = tmpAppointmentList[this.data.appointmentDate].times[e.currentTarget.dataset.index].name
    this.setData({
      appointmentList: tmpAppointmentList,
      time: tmpTime
    })
  },

  getTimeList: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/stime/list/" + that.data.hairId,
      header: {
        'content-type': 'application/json',
        'authorization': "Bearer " + token,
      },
      method: "GET",
      data: {},
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取发型师可预约时间列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        res.data = util.jsonOptimize(res.data)
        if (res.data) {
          for (var i = res.data.length - 1; i >= 0; i--) {
            if (util.isNull(res.data[i].times)) {
              res.data.splice(i, 1)
            }
          }

          var date = "当前发型师无可预约的时间"
          if (res.data.length == 0) {
            res.data[0] = { date }
          }

          that.setData({
            appointmentList: res.data,
            date: res.data[0].date
          })
        }
      }
    })
  },

  memoTapEvent: function (e) {
    var memo = e.currentTarget.dataset.memo
    if (util.isNull(memo)) {
      return
    }

    wx.showModal({
      title: '',
      content: memo,
      showCancel: false,
    })
  },
})