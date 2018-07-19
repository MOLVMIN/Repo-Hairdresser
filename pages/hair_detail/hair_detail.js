// pages/hair_detail/hair_detail.js
var app = getApp()
var util = require('../../utils/util.js')
var request = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    hairdresserId: '',
    hairAvatar: '',
    hairdresserDetail: null,
    evaluateTotleNum: '',
    evaluateMarkAv: 0,
    evaluateList: [],
    evaluateSize: 10,
    evaluatePage: 0,
    worksList: [],
    showWorkList: [],
    isCanload: true,
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
    console.log(options.avatarPath)
    this.setData({
      hairdresserId: options.id,
      // hairAvatar: options.avatarPath,
      options: options
    })
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.locateHairDetail()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.locateHairDetail()
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
        hairdresserId: '',
        hairdresserDetail: null,
        evaluateTotleNum: '',
        evaluateMarkAv: 0,
        evaluateList: [],
        evaluateSize: 10,
        evaluatePage: 0,
        worksList: [],
        showWorkList: [],
        isCanload: true,
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

  orderTapEvent: function () {
    if (util.isNull(this.data.hairdresserDetail)) {
      return
    }
    var that = this
    var memo = that.data.hairdresserDetail.memo
    if (util.isNull(memo)) {
      memo = ''
    }
    wx.navigateTo({
      url: '../../pages/order/order?hairId=' + that.data.hairdresserDetail.id + '&hairName=' + that.data.hairdresserDetail.name + '&shopId=' + that.data.hairdresserDetail.shopId + '&shopName=' + that.data.hairdresserDetail.shopName + '&memo=' + memo,
    })
  },

  locateHairDetail: function () {
    var that = this
    wx.getLocation({
      success: function (res) {
        that.getHairdresserDetail(res.latitude, res.longitude)
      },
      fail: function () {
        that.getHairdresserDetail(23.360151, 116.688462)
      }
    })
  },

  getHairdresserDetail: function (lat, lon) {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/" + that.data.hairdresserId,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "latitude": lat,
        "longitude": lon
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取发型师信息失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var imagePathList = []
        for (var i in res.data.imageIds) {
          imagePathList[i] = app.http.host + 'images/f/' + res.data.imageIds[i]
        }
        res.data.imagePathList = imagePathList
        var tmpWorksList = []
        for (var i in res.data.worksInfos) {
          res.data.worksInfos[i].imageId = request.host + "images/f/" + res.data.worksInfos[i].imageId
          tmpWorksList.push(res.data.worksInfos[i].imageId)
        }
        console.log(tmpWorksList)
        
        // 将有置顶字段的全部放到数组开头
        var removedList = []
        for (var i in res.data.worksInfos) {
          var showWork = res.data.worksInfos[i]
          if (showWork.putop != undefined && showWork.putop === true) {
            // 删除
            console.log(showWork)
            var removed = tmpWorksList.splice(i, 1)
            removedList.splice(i, 1, removed)
          }
        }

        console.log(removedList)
        for (var i in removedList) {
          // 插入首部
          var insert = tmpWorksList.splice(0, 0, removedList[i]); 
        }

        // 取前5条数据
        var tmpShowWorkList = []
        for (var i = 0; i < 5; i++) {
          var showWork = tmpWorksList[i]
          if (!util.isNull(showWork)) {
            tmpShowWorkList.push(showWork)
          }
        }
        
        that.setData({
          hairdresserDetail: res.data,
          worksList: tmpWorksList,
          showWorkList: tmpShowWorkList,
        })
        wx.setNavigationBarTitle({
          title: res.data.shopName + '-' + res.data.name,
        })

        that.getEvaluateList()
      }
    })
  },

  shopDetailEvent: function () {
    if (util.isNull(this.data.hairdresserDetail)) {
      return
    }
    wx.navigateTo({
      url: '../../pages/store_detail/store_detail?id=' + this.data.hairdresserDetail.shopId
    })
  },

  workDetailEvent: function () {
    if (util.isNull(this.data.hairdresserDetail)) {
      return
    }
    var that = this
    wx.navigateTo({
      url: '../../pages/work_detail/work_detail?hairid=' + that.data.hairdresserDetail.id
    })
  },

  navEvent: function (e) {
    if (util.isNull(this.data.hairdresserDetail)) {
      return
    }
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/" + that.data.hairdresserDetail.shopId,
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
          return
        }
        res.data = util.jsonOptimize(res.data)
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
    if (util.isNull(this.data.hairdresserDetail)) {
      return
    }
    wx.showLoading({
      title: '加载中…',
    })
    var that = this
    console.log(that.data.hairdresserDetail.id)
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "metes/client/hairdresser/" + that.data.hairdresserDetail.id + "/" + that.data.evaluateSize + "/" + that.data.evaluatePage,
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
            title: '获取评论列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
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

  imgPreview: function (e) {
    //图片预览
    var src = e.currentTarget.dataset.src
    var srclist = e.currentTarget.dataset.srclist
    wx.previewImage({
      urls: [src],
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  // 关注发型师
  atEvent: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/at/" + that.data.hairdresserId,
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
            title: '关注发型师失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
        res.data = util.jsonOptimize(res.data)
        var tmpHairdresserDetail = that.data.hairdresserDetail
        tmpHairdresserDetail.isAt = true
        tmpHairdresserDetail.fansCount += 1
        that.setData({
          hairdresserDetail: tmpHairdresserDetail
        })
      }
    })
  },

  // 取消关注发型师
  ctEvent: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/ct/" + that.data.hairdresserId,
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
        res.data = util.jsonOptimize(res.data)
        var tmpHairdresserDetail = that.data.hairdresserDetail
        tmpHairdresserDetail.isAt = false
        tmpHairdresserDetail.fansCount -= 1
        that.setData({
          hairdresserDetail: tmpHairdresserDetail
        })
      }
    })
  }
})