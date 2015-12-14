/***
 Author: ec.huyinghuan@gmail.com
 Date: 2015-12-06
*/
$(function(){
  var uid = $("#userUID").val();
  var groupId = $("#userGroupId").val();
  var tSource = '{{each serverList as server index}}\n<div class="m-result">\n   <div class="m-info">\n       {{server.area}} > {{server.name}}\n       <span class="status status-{{server.status}}">\n           {{server.status | getStatusText}}\n       </span>\n   </div>\n   <div class="m-info">\n       最新开服记录\n       <span class="recent">\n           {{server.latest}}<em>（{{server.latest | getXQDay}}）</em>\n       </span>\n   </div>\n   <div class="m-info">\n       上一次记录\n       <span class="history">\n           {{server.history}}<em>（{{server.history | getXQDay}}）</em>\n       </span>\n   </div>\n   <div class="m-panel">\n       <ul>\n         <!-- 已结操作后同时还要给li添加.has -->\n         <li class="top" data-id="{{server.id}}" data-top="{{server.isTop}}"><i class="u-icon-top {{if server.isTop}}istop{{/if}}"></i><b>{{server.isTop | getTopText}}</b></li>\n         <li class="fav" data-id="{{server.id}}" data-collect="{{server.isCollect}}"><i class="u-icon-fav {{if server.isCollect}}isfav{{/if}}"></i><b>{{server.isCollect | getCollectText}}</b></li>\n         <!-- <li class="feed" data-id="{{server.id}}" data-top="{{server.isFeed}}"><i class="u-icon-feed"></i><b>订阅</b></li> -->\n       </ul>\n   </div>\n</div>\n{{/each}}';
  //待编译源码
  var serverItemsRender = template.compile(tSource);
  
  template.helper('getTopText', function (isTop) {
    return isTop ? "取消置顶" : "置顶";
  });

  template.helper('getStatusText', function (status) {
    return ['畅通', '爆满', '维护'][status-1] || '未知';
  });
  template.helper('getXQDay', function (date) {
    date = date.replace(/^\s/, "");
    var r_year = parseInt(date.substr(0,4));
    var r_month = parseInt(date.substr(5,2));
    var r_day = parseInt(date.substr(8,2));

    var recordDate = new Date(r_year, r_month - 1, r_day);
    var recordDay = recordDate.getDay();
    var text = "本";
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDate() - today.getDay();
    //这周一的开始
    var toMonday = new Date(year, month, day);
    if(recordDate.getTime() < toMonday.getTime()){
      text = "上";
    }
    return　text　+　["周天", "周一", "周二", "周三", "周四", "周五", "周六"][recordDay];　 　
  });
  template.helper('getCollectText', function (isCollect) {
    return isCollect ? "取消收藏" : "收藏";
  });
  
  //排序
  var doSort = function(queue){
    var top = [];
    var normal = [];
    for(var index = 0; index < queue.length; index++){
      var server = queue[index];
      if(server.isTop){
        top.push(server);
      }else{
        normal.push(server);
      }
    }
    return top.concat(normal);
  };
  
  //分类
  var doClassify = function(queue){
    var obj = {};
    for(var index = 0; index < queue.length; index++){
      var server = queue[index];
      if(!obj[server.area]){
        obj[server.area] = [server]
      }else{
        obj[server.area].push(server)
      }
    }
    return obj;
  }
  
  //匹配对应的服务器
  var getMyTopAndFavServerList = function(){
    var result = [];
    for(var index = 0; index < allData.length; index++){
      var server = allData[index];
      if(server.isTop || server.isCollect){
        result.push(server);
      }
    }
    return result;
  }
  
  //匹配对应的服务器
  var doSearch = function(serverName){
    if(!serverName){
      return allData;
    }
    var result = [];
    for(var index = 0; index < allData.length; index++){
      var server = allData[index];
      if(server.area.indexOf(serverName) != -1 || server.name.indexOf(serverName) != -1){
        result.push(server);
      }
    }
    return result;
  }
  //根据id搜索
  var doSearchById = function(id){
    var result = [];
    for(var index = 0; index < allData.length; index++){
      var server = allData[index];
      if((server.id+"") === (id+"")){
        return [server]
      }
    }
    return [];
  }
  
  
  var allData = [];
  var classifyData = {};
  
  //获取服务器列表
  var getServerList = function(serverName, cb, forceFresh){
    if(allData.length && !forceFresh){
      return cb && cb({serverList: doSearch(serverName)});
    }
    jQuery.get("/api/server/list.php", function(data){
      data = JSON.parse(data);
      allData = doSort(data);
      classifyData = doClassify(allData);
      return cb && cb({serverList:allData});
    });
  }
    
  //加载大区
  var loadArea = function(){
    var queue = [];
    var firstArea = null;
    for(x in classifyData){
      if(!firstArea){firstArea = x}
      queue.push("<option value='"+x+"'>"+x+"</option>");
    }
    document.getElementById('chooseArea').innerHTML = queue.join('');
    loadServer(firstArea);
  }
  
  //加载服务器
  var loadServer = function(areaName){
    var serverList = classifyData[areaName];
    var queue = [];
    for(var index = 0; index < serverList.length; index++){
       queue.push("<option value='"+serverList[index].id+"'>"+serverList[index].name+"</option>");
    }
    document.getElementById('chooseServer').innerHTML = queue.join('');
  }
  
  //置顶
  var letServerTop = function(id, isTop, cb){
    jQuery.get("/api/server/action.php", {
      do: 'top',
      serverid: id,
      value: ((isTop + "") == "1" ? 0 : 1)
    }, cb)
  }

  //收藏
  var letServerFav = function(id, isCollect, cb){
    jQuery.get("/api/server/action.php", {
      do: 'collect',
      serverid: id,
      backgroundcolor: "#ff99cc",
      value: ((isCollect + "") == "1" ? 0 : 1)
    }, cb)
  }
  //改区
  $("#chooseArea").change(function(){
    loadServer($(this).val());
  });
  
//  $("#searchBtn").click(function(){
//    var searchText = $("#search_txt").val();
//    var result = doSearch(searchText);
//    renderResult({serverList:result});
//  });
  
  $("#searchLink").click(function(){
    var result = null;
    if($("#search_txt").val()){
      result = doSearch($("#search_txt").val());
    }else{
      result = doSearchById($("#chooseServer").val());
    }
    renderResult({serverList:result});
  });
  
  $("#backSearch").click(function(){
    $("#showDetailsResult").slideUp();
    $("#chooseAndSearchContent").slideDown();
    $("#top-back").hide();
  });
  
  $("#backSearchResult").click(function(){
    $("#showActionResult").slideUp();
    $("#showDetailsResult").slideDown();
  });
  
  $("#top-back").click(function(){
    $("#showDetailsResult").slideUp();
    $("#chooseAndSearchContent").slideDown();
    $("#top-back").hide();
  });
  
  var showError = function(code){
    $("#showDetailsResult").slideUp();
    $("#showActionResult").slideDown();
    $("#showActionResult").find(".app-dialog-tips").hide();
    $('#action_error_'+code).show();
  }
  
  var doActionAfterUserDone = function(result){
    result = JSON.parse(result);
    //操作失败！
    var code = result.code;
    if(code != 0){
      showError(code);
      return;
    }
    //操作成功!
    getServerList(null, function(data){
        var result = null;
        if($("#search_txt").val()){
          result = doSearch($("#search_txt").val());
        }else{
          result = doSearchById($("#chooseServer").val());
        }
        renderResult({serverList: result});
     }, true);
  };
  
  var bindUserActionForServerItem = function(){
    //置顶
    $("#searchResult").find(".top").click(function(){
      //游客
      if((""+groupId) == "7"){
        showError(1);
        return;
      }
      letServerTop($(this).data('id'), $(this).data('top'), doActionAfterUserDone);
    });
    //收藏
    $("#searchResult").find(".fav").click(function(){
      //游客
      if((""+groupId) == "7"){
        showError(1);
        return;
      }
      //VIP 需要VIP才能收藏
//      if(("" + groupId) != "22"){
//        showError(3);
//        return;
//      }
      letServerFav($(this).data('id'), $(this).data('collect'), doActionAfterUserDone);
    });
    //订阅
    $("#searchResult").find(".feed").click(function(){
      letServerFeed($(this).data('id'), $(this).data('feed'), doActionAfterUserDone);
    });
  }
  
  var renderResult = function(result){
    $("#searchResult").html(serverItemsRender(result));
    if(result.serverList.length > 3){
      $("#top-back").show();
    }
    $("#chooseAndSearchContent").slideUp();
    $("#showDetailsResult").slideDown();
    bindUserActionForServerItem();
  };

  getServerList('', loadArea, true);
  
  //底部菜单　我的
  $(".app-footer .item-2").click(function(){
    if((""+groupId) == "7"){
        showError(1);
        return;
     }
     renderResult({serverList:getMyTopAndFavServerList()});
  })
  
});