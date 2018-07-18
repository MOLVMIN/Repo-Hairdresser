function formatDate(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    return [year, month, day].map(formatNumber).join('-')
}
function formatTime(date) {
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function formatduration(duration) {
    duration = new Date(duration);
    let mint = duration.getMinutes();
    let sec = duration.getSeconds();
    return formatNumber(mint) + ":" + formatNumber(sec);
}

function queryToObject(str) {
    var s = str.split("&");
    var param2 = {};
    for (var i = 0; i < s.length; i++) {
        var d = s[i].split("=");
        param2[d[0]] = d[1]
    }
    return param2;
}
function objectToString(param2) {
    var arr = [];
    for (var i in param2) {
        arr.unshift(i + "=" + param2[i]);
    }
    return arr.join("&");
}

function ksort(src) {
    var keys = Object.keys(src),
        target = {};
    keys.sort();
    keys.forEach(function (key) {
        target[key] = src[key];
    });
    return target;
}
function parseQueryString(url) {
    var str = url.split("?")[1];
    var result = {};
    if (str) {
        var items = str.split("&");
        var arr = [];
        for (var i = 0; i < items.length; i++) {
            arr = items[i].split('=');
            result[arr[0]] = arr[1];
        }
    }
    return result;
}

function jsonToStr(json) {
    return JSON.stringify(json)
}

function strToJson(str) {
    return JSON.parse(str)
}

function getCurDay() {
    var str = "";
    var week = new Date().getDay();
    switch (week) {
        case 0:
            str = "星期日"
            break;
        case 0:
            str = "星期一"
            break;
        case 0:
            str = "星期二"
            break;
        case 0:
            str = "星期三"
            break;
        case 0:
            str = "星期四"
            break;
        case 0:
            str = "星期五"
            break;
        case 0:
            str = "星期六"
            break;
        default:
            break;
    }
    return str;
}

function jsonOptimize(json) {
  for(var index in json) {
    if (isNull(json[index])) {
      json[index] = ''
    }
    else if (typeof(json[index]) == 'object') {
      json[index] = jsonOptimize(json[index])
    }
  }
  return json
}

function isNull(value) {
  if (typeof(value) == 'undefined'){
    return true
  }
  if (value == null) {
    return true
  }
  if (typeof(value) == 'string') {
    return (trim(value) == '')
  }

  return false
}

function trim(str) {
  if (str == null){
    return ''
  }

  return str.replace(/(^\s*)|(\s*$)/g, "")
}

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}

//比较日前大小  
function compareDate(checkStartDate, checkEndDate) {
  var arys1 = new Array();
  var arys2 = new Array();
  if (checkStartDate != null && checkEndDate != null) {
    arys1 = checkStartDate.split('-');
    var sdate = new Date(arys1[0], parseInt(arys1[1] - 1), arys1[2]);
    arys2 = checkEndDate.split('-');
    var edate = new Date(arys2[0], parseInt(arys2[1] - 1), arys2[2]);
    if (sdate > edate) {
      //alert("日期开始时间大于结束时间");
      return false;
    } else {
      //alert("通过");
      return true;
    }
  }
}

//判断日期，时间大小  
function compareTime(startDate, endDate) {
  if (startDate.length > 0 && endDate.length > 0) {
    var startDateTemp = startDate.split(" ");
    var endDateTemp = endDate.split(" ");

    var arrStartDate = startDateTemp[0].split("-");
    var arrEndDate = endDateTemp[0].split("-");

    var arrStartTime = startDateTemp[1].split(":");
    var arrEndTime = endDateTemp[1].split(":");

    var allStartDate = new Date(arrStartDate[0], arrStartDate[1], arrStartDate[2], arrStartTime[0], arrStartTime[1], arrStartTime[2]);
    var allEndDate = new Date(arrEndDate[0], arrEndDate[1], arrEndDate[2], arrEndTime[0], arrEndTime[1], arrEndTime[2]);

    if (allStartDate.getTime() >= allEndDate.getTime()) {
      //alert("startTime不能大于endTime，不能通过");
      return false;
    } else {
      //alert("startTime小于endTime，所以通过了");
      return true;
    }
  } else {
    //alert("时间不能为空");
    return false;
  }
}
//比较日期，时间大小  
function compareCalendar(startDate, endDate) {
  if (startDate.indexOf(" ") != -1 && endDate.indexOf(" ") != -1) {
    //包含时间，日期  
    return compareTime(startDate, endDate);
  } else {
    //不包含时间，只包含日期  
    return compareDate(startDate, endDate);
  }
}

function checkMsg (msg){
  return msg.replace(/查无实体对象: /g, '')
}

module.exports = {
    ksort: ksort,
    parseQueryString: parseQueryString,
    formatDate: formatDate,
    formatTime: formatTime,
    queryToObject: queryToObject,
    objectToString: objectToString,
    formatduration: formatduration,
    strToJson: strToJson,
    jsonToStr: jsonToStr,
    getCurDay: getCurDay,
    jsonOptimize: jsonOptimize,
    isNull: isNull,
    getNowFormatDate: getNowFormatDate,
    compareCalendar: compareCalendar,
    compareTime: compareTime,
    compareDate: compareDate,
    checkMsg: checkMsg,
}
