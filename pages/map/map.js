// pages/map/map.js
var app = getApp()
Page({
    /**
    * 页面的初始数据
    */
    data: {
      shopId : '',
      shopName: '',
      lon : '',
      lat : '',
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.setData({
        shopId: options.id,
      })
      var that = this
      if (app.globalData.token == "") {
        app.getTokenInfo()
        app.tokenInfoReadyCallback = res => {
          that.getShopLocation()
        }
      }
      else {
        app.refreshTokenInfo()
        app.refreshTokenInfoReady = res => {
          that.getShopLocation()
        }
      }  
    },
    onReady: function (e) {
        // 使用 wx.createMapContext 获取 map 上下文
        //this.mapCtx = wx.createMapContext('myMap')
    },
    getShopLocation : function () {
      var that = this
      app.http.request({
        url: "shops/" + this.data.shopId,
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + app.globalData.token,
        },
        method: "GET",
        success: function (res) {
          console.log(res)
        if (res.statusCode != 200) {
          return
        }
          that.setData({
            shopName: res.data.name,
            lon: res.data.longitude,
            lat: res.data.latitude,
          })
          that.openLocationFun()
        }
      })
    },

    getCenterLocation: function () {
        this.mapCtx.getCenterLocation({
            success: function (res) {
                console.log(res.longitude)
                console.log(res.latitude)
            }
        })
    },
    moveToLocation: function () {
        this.mapCtx.moveToLocation()
    },
    translateMarker: function () {
        this.mapCtx.translateMarker({
            markerId: 0,
            autoRotate: true,
            duration: 1000,
            destination: {
                latitude: 23.10229,
                longitude: 113.3345211,
            },
            animationEnd() {
                console.log('animation end')
            }
        })
    },
    includePoints: function () {
        this.mapCtx.includePoints({
            padding: [10],
            points: [{
                latitude: 23.10229,
                longitude: 113.3345211,
            }, {
                latitude: 23.00229,
                longitude: 113.3345211,
            }]
        })
    },
    openLocationFun: function() {
        wx.openLocation({
            latitude: this.data.lat,
            longitude: this.data.lon,
            scale: 28,
            name: this.data.shopName,
            // address: '',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        })
    }
})