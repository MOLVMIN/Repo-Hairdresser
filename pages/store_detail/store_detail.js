// pages/store_detail/store_detail.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    storeId: '',
    storeDetail: {},
    evaluateTotleNum: '',
    evaluateMarkAv: 0,
    evaluateList: [],
    evaluateSize: 10,
    evaluatePage: 0,
    isCanload: true,
    info: '',
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      storeId: options.id,
      options: options
    })
    wx.setNavigationBarTitle({
      title: options.title,
    })
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.locateStoreDetail()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.locateStoreDetail()
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
        imgUrls: [],
        storeId: '',
        storeDetail: {},
        evaluateTotleNum: '',
        evaluateMarkAv: 0,
        evaluateList: [],
        evaluateSize: 10,
        evaluatePage: 0,
        isCanload: true,
        info: '',
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
    if (this.data.isCanload == true) {
      this.getEvaluateList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  locateStoreDetail: function () {
    var that = this
    wx.getLocation({
      success: function (res) {
        that.getStoreDetail("发廊", res.latitude, res.longitude)
      },
      fail: function () {
        that.getStoreDetail("发廊", 23.360151, 116.688462)
      }
    })
  },

  getStoreDetail: function (str, lat, long) {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/" + that.data.storeId,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      data: {
        "keyStr": str,
        "latitude": lat,
        "longitude": long
      },
      method: "POST",
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取理发店信息失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }
        res.data = util.jsonOptimize(res.data)
        var imagePathList = []
        for (var i in res.data.imageIds) {
          imagePathList[i] = app.http.host + 'images/f/' + res.data.imageIds[i]
        }
        if (imagePathList.length > 5) {
          var tmplist = []
          for (var i = 0; i < 5; i++) {
            var pa = imagePathList[i]
            tmplist.push(pa)
          }
          imagePathList = tmplist
        }
        res.data.imagePathList = imagePathList


        for (var i in res.data.hairdresser) {
          res.data.hairdresser[i].imagePath = app.http.host + 'images/f/' + res.data.hairdresser[i].imageId
        }

        that.setData({
          storeDetail: res.data
        })

        that.getEvaluateList()
      },
      fail: function (res) {
        that.setData({
          info: "fail" + res
        })
      }
    })
  },

  navEvent: function (e) {
    if (util.isNull(this.data.storeDetail)) {
      return
    }
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/" + that.data.storeDetail.id,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '导航失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }
        wx.openLocation({
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          scale: 28,
          name: res.data.name,
          // address: '',
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    })
  },

  getEvaluateList: function (e) {
    if (util.isNull(this.data.storeDetail)) {
      return
    }
    wx.showLoading({
      title: '加载中…',
    })
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "metes/client/shop/" + that.data.storeDetail.id + "/" + that.data.evaluateSize + "/" + that.data.evaluatePage,
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
          wx.showModal({
            title: '获取理发店评论列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }

        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanload: false
          })
          return
        }

        res.data = util.jsonOptimize(res.data)
        for (var i in res.data.rows) {
          res.data.rows[i].image0 = (res.data.rows[i].mark >= 1 ? '/imgs/star_active.png' : '/imgs/star_gray.png')
          res.data.rows[i].image1 = (res.data.rows[i].mark >= 2 ? '/imgs/star_active.png' : '/imgs/star_gray.png')
          res.data.rows[i].image2 = (res.data.rows[i].mark >= 3 ? '/imgs/star_active.png' : '/imgs/star_gray.png')
          res.data.rows[i].image3 = (res.data.rows[i].mark >= 4 ? '/imgs/star_active.png' : '/imgs/star_gray.png')
          res.data.rows[i].image4 = (res.data.rows[i].mark >= 5 ? '/imgs/star_active.png' : '/imgs/star_gray.png')
          res.data.rows[i].avatarImage = app.http.host + 'images/f/' + res.data.rows[i].imageId
          if (res.data.rows[i].time) {
            res.data.rows[i].commitTime = res.data.rows[i].time.substring(0, 10)
          } else {
            res.data.rows[i].commitTime = ''
          }
        }
        if (res.data.markAv) {
          that.setData({
            evaluateMarkAv: res.data.markAv,
          })
        }

        that.setData({
          evaluateTotleNum: res.data.total,
          evaluateList: that.data.evaluateList.concat(res.data.rows),
          evaluatePage: that.data.evaluatePage + 1
        })
        console.log(that.data.evaluateList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  // 关注理发店
  atEvent: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/at/" + that.data.storeId,
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
            title: '关注理发店失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }
        if (res.data.reMsg == '已关注过，无需再操作') {
          return;
        }
        var tmpStoreDetail = that.data.storeDetail
        tmpStoreDetail.isAt = true
        tmpStoreDetail.fansCount += 1
        that.setData({
          storeDetail: tmpStoreDetail
        })
      }
    })
  },

  // 取消关注理发店
  ctEvent: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/ct/" + that.data.storeId,
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
          return;
        }
        var tmpStoreDetail = that.data.storeDetail
        tmpStoreDetail.isAt = false
        tmpStoreDetail.fansCount -= 1
        that.setData({
          storeDetail: tmpStoreDetail
        })
      }
    })
  },

  hairDetailEvent: function (e) {
    wx.navigateTo({
      url: '../../pages/hair_detail/hair_detail?id=' + e.currentTarget.dataset.hairid
    })
  },
})