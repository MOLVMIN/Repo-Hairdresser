// pages/activity/activity.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: [],
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '优惠活动',
    })
    wx.showShareMenu({
      withShareTicket: true
    })
    var that = this
    that.setData({
      options: options
    })
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getActivityList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getActivityList()
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
        activityList: [],
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
    return {
      title: '胡头理连锁优惠活动',
      path: '/pages/activity/activity',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  getActivityList: function () {
    let that = this
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    var deadtime = new Date
    var deadD = deadtime.toLocaleDateString()
    deadD = deadD.split('/').join('-')
    var deadT = deadtime.toTimeString()
    deadT = deadT.substring(0, 8)
    var deadline = deadD + " " + deadT
    console.log(deadline)
    app.http.request({
      url: "activitys/list",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      data: {
        "dataMap": {
          "deadline": deadline,
          "hairdresserId": -1,
        },
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
      method: "POST",
      success: function (res) {
        console.log(res.data)
        wx.hideLoading()

        if (res.statusCode != 200) {
          console.log("获取优惠活动列表失败")
          wx.showModal({
            title: '获取优惠活动列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        res.data = util.jsonOptimize(res.data)

        if (util.isNull(res.data.rows)) {
          return
        }

        res.data.rows.sort(function (obj1, obj2) {
          var val1 = obj1.deadline;
          var dt1 = new Date(val1)
          var val2 = obj2.deadline;
          var dt2 = new Date(val2)
          var comp1 = dt1.getTime();
          var comp2 = dt2.getTime();
          if (comp1 < comp2) {
            return -1;
          } else if (comp1 > comp2) {
            return 1;
          } else {
            return 0;
          }
        })

        for (var i in res.data.rows) {
          if (util.isNull(res.data.rows[i].imageIds)) {
            res.data.rows[i].imageIds = []
            res.data.rows[i].imageIds.push('/imgs/no_img_black.png')
          } else {
            for (var j in res.data.rows[i].imageIds) {
              res.data.rows[i].imageIds[j] = app.http.host + 'images/f/' + res.data.rows[i].imageIds[j]
            }
          }
        }

        that.setData({
          activityList: res.data.rows
        })
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  activityTapEvent: function (e) {
    var index = e.target.dataset.index
    console.log(index)
    var coupons = this.data.activityList[index]
    var strCoupons = util.jsonToStr(coupons)
    wx.navigateTo({
      url: '../../pages/activity_detail/activity_detail?couponsJson=' + strCoupons,
    })
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
          if (res.statusCode != 200) {
            console.log("领取失败")
            wx.showModal({
              title: '领取失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            return
          }

          // wx.showToast({
          //   title: '领取失败',
          // })
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
  },

})