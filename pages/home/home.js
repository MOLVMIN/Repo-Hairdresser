// pages/home/home.js
var util = require('../../utils/util.js')
var request = require('../../utils/request.js')
var app = getApp()
var token = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: "middle",
    storeList: [],
    hairdresserList: [],
    storePage: 0,
    hairPage: 0,
    pageSize: 10,
    isCanloadStore: true,
    isCanloadHair: true,
    storeSearchText: '',
    hairSearchText: '',
    options: {},
    couponsImage: '/imgs/coupons.png',
    storeImage: '/imgs/storelight.png',
    hairImage: '/imgs/hair.png',
    showModal: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    
    that.setData({
      storePage: 0,
      hairPage: 0,
      page_size: 10,
      isCanloadOngoing: true,
      isCanloadComplete: true,
      options: options,
    })

    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      console.log("onLoad getTokenInfo")
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getWxInfo()

        that.getStoreList()
        that.getHairdresserList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        console.log("onLoad refreshTokenInfo")
        that.getWxInfo()

        that.getStoreList()
        that.getHairdresserList()
      }
    }
  },

  getWxInfo: function() {
    var that = this
    that.setData({
      showModal: false,
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        wx.getUserInfo({
          success: res => {
            console.log(res)
            // 可以将 res 发送给后台解码出 unionId
            app.globalData.userInfo = res.userInfo
            that.createWxInfo()
          },
          fail: res => {
            console.log(res)
            if (res.errMsg != "getUserInfo:fail auth deny") {
              that.showDialogBtn()
            }
          }
        })
      },
      fail: res => {
        console.log(res)
      }
    })
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
    console.log("onShow refreshTokenInfo")
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
        currentTab: "middle",
        storeList: [],
        hairdresserList: [],
        storePage: 0,
        hairPage: 0,
        pageSize: 10,
        isCanloadStore: true,
        isCanloadHair: true,
        storeSearchText: '',
        hairSearchText: '',
        couponsImage: '/imgs/coupons.png',
        storeImage: '/imgs/storelight.png',
        hairImage: '/imgs/hair.png',
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
    if (this.data.currentTab == 'middle') {
      if (this.data.isCanloadStore == true) {
        console.log("store4")
        this.getStoreList(this.data.storeSearchText)
      }
    } else if (this.data.currentTab == 'right'){
      if (this.data.isCanloadHair == true) {
        this.getHairdresserList(this.data.hairSearchText)
      }
    }
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
      title: '胡头理连锁',
      path: '/pages/home/home',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /***********************************************************
   * 自定义函数区
   ***********************************************************/


  // 切换理发店tab和发型师tab时调用
  tabEvent: function (e) {
    var that = this
    if (e.currentTarget.dataset.tab == 'middle') {
      that.setData({
        currentTab: 'middle',
        storeImage: '/imgs/storelight.png',
        hairImage: '/imgs/hair.png'
      })
    }
    else if (e.currentTarget.dataset.tab == 'right') {
      that.setData({
        currentTab: 'right',
        storeImage: '/imgs/store.png',
        hairImage: '/imgs/hairlight.png'
      })
    }
    else if (e.currentTarget.dataset.tab == 'left') {
      wx.navigateTo({
        url: '../../pages/activity/activity'
      })
    }
  },

  navEvent: function (e) {
    var that = this
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/" + e.currentTarget.dataset.id,
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
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  stores_detail_info: function (e) {
    wx.navigateTo({
      url: '../../pages/store_detail/store_detail?id=' + e.currentTarget.dataset.id + '&title=' + e.currentTarget.dataset.title
    })
  },

  haires_detail_info: function (e) {
    wx.navigateTo({
      url: '../../pages/hair_detail/hair_detail?id=' + e.currentTarget.dataset.id + '&avatarPath=' + e.currentTarget.dataset.path
    })
  },

  getStoreList: function (keyStr) {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        that.locateStoreList(keyStr, res.longitude, res.latitude)
      },
      fail: function (res) {
        console.log(res)
        that.locateStoreList(keyStr, 116.688462, 23.360151)
      }
    })

  },

  locateStoreList: function (keyStr, lon, lat) {
    var that = this
    // console.log(keyStr)
    // console.log(lon)
    // console.log(lat)
    // console.log(that.data.pageSize)
    // console.log(that.data.storePage)
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "shops/" + that.data.pageSize + "/" + that.data.storePage,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "keyStr": keyStr,
        "latitude": lat,
        "longitude": lon,
        "range": "100"
      },
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        wx.stopPullDownRefresh()

        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取理发店列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanloadStore: false
          })
          if (util.isNull(keyStr)) {
            wx.showModal({
              title: '',
              content: '暂无更多理发店数据',
              showCancel: false,
            })
          }
          return
        }

        res.data = util.jsonOptimize(res.data)

        var tmpStoreList = res.data.rows
        for (var i in tmpStoreList) {
          for (var j in tmpStoreList[i].imageIds) {
            tmpStoreList[i].imageIds[j] = request.host + "/images/f/" + tmpStoreList[i].imageIds[j]
          }
        }
        //console.log(tmpStoreList)
        that.setData({
          storeList: that.data.storeList.concat(tmpStoreList),
          storePage: that.data.storePage + 1
        })
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  getHairdresserList: function (keyStr) {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        that.locateHairList(keyStr, res.longitude, res.latitude)
      },
      fail: function (res) {
        console.log(res)
        that.locateHairList(keyStr, 116.688462, 23.360151)
      }
    })
  },

  locateHairList: function (keyStr, lon, lat) {
    var that = this
    // console.log(keyStr)
    // console.log(lon)
    // console.log(lat)
    // console.log(that.data.pageSize)
    // console.log(that.data.hairPage)
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/" + that.data.pageSize + "/" + that.data.hairPage,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token
      },
      method: "POST",
      data: {
        "keyStr": keyStr,
        "latitude": lat,
        "longitude": lon,
        "range": "100"
      },
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        wx.stopPullDownRefresh()

        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取发型师列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return;
        }

        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanloadHair: false
          })
          if (util.isNull(keyStr)) {
            wx.showModal({
              title: '',
              content: '暂无更多发型师数据',
              showCancel: false,
            })
          } 
          return
        }

        res.data = util.jsonOptimize(res.data)

        for (var i in res.data.rows) {
          res.data.rows[i].imageId = request.host + "images/f/" + res.data.rows[i].imageId
        }
        that.setData({
          hairdresserList: that.data.hairdresserList.concat(res.data.rows),
          hairPage: that.data.hairPage + 1
        })
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  searchEvent: function (e) {
    if (this.data.currentTab == "middle") {
      this.setData({
        storeList: [],
        storePage: 0,
        isCanloadStore: true,
        storeSearchText: e.detail.value
      })
      this.getStoreList(e.detail.value)
    } else if (this.data.currentTab == "right") {
      this.setData({
        hairdresserList: [],
        hairPage: 0,
        isCanloadHair: true,
        hairSearchText: e.detail.value
      })
      this.getHairdresserList(e.detail.value)
    }
  },

  createWxInfo: function () {
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "users/wx",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      data: {
        "city": app.globalData.userInfo.city,
        "country": app.globalData.userInfo.country,
        "gender": app.globalData.userInfo.gender,
        "imageUrl": app.globalData.userInfo.avatarUrl,
        "language": app.globalData.userInfo.language,
        "nickname": app.globalData.userInfo.nickName,
        "province": app.globalData.userInfo.province,
      },
      method: "POST",
      success: function (res) {
        console.log(res)

        if (res.statusCode != 200){
          console.log("用户信息更新失败")
          wx.showModal({
            title: '用户信息更新失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        //console.log("store6")
        //that.getStoreList()
        //that.getHairdresserList()
      },
      fail: function (res) {
        console.log("fail:" + res)
      }
    })
  },

  /**
     * 弹窗
     */
  showDialogBtn: function () {
    this.setData({
      showModal: true,
    })
  },

  inputChange: function (e) {
    this.setData({
      currentCcode: e.detail.value
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();

    if (this.data.currentCcode == '') {
      wx.showModal({
        title: '提示',
        content: '请输入核销码',
        showCancel: false
      })
      return
    }
    this.serviceBtn(this.data.currentId, this.data.currentCcode)
  },

})

