/***
 Author: ec.huyinghuan@gmail.com
 Date: 2015-12-03
*/
H.ready(['jquery', 'template'],function(){
  var tSource = '<li class="app-servers-list-item app-servers-list-header">\n    <span class="daqu">大区</span>\n    <span class="fwq">服务器</span>\n    <span class="status">状态</span>\n    <span class="recent">最近开服记录</span>\n    <span class="history">上一次记录</span>\n    <span class="top">置顶</span>\n    <span class="fav">收藏</span>\n    <span class="feed">订阅</span>\n</li>\n<!--第一条被置顶的条目添加.app-servers-list-item-top-->\n<!--被收藏的条目添加.app-servers-list-item-fav，并且行内输出自定义的背景色-->\n<!--没有被收藏和置顶的才添加app-servers-list-item-normal，一旦添加了则移除这个类名-->\n<!--畅通状态1添加status-1-->\n<!--爆满状态2添加status-2-->\n<!--维护状态3添加status-3-->\n\n{{each serverList as server index}} \n  <li class="app-servers-list-item\n      {{if server.isTop}}app-servers-list-item-top{{/if}}\n      {{if server.isSubscribe}}app-servers-list-item-fav{{/if}}\n      {{server | getNormalClass}}\n      ">\n      <span class="daqu">{{server.area}}</span>\n      <span class="fwq">{{server.name}}</span>\n      <span class="status status-{{server.status}}">{{server.status | getStatusText}}</span>\n      <span class="recent">{{server.latest}}<em>({{server.latest | getXQDay}})</em></span>\n      <span class="history">{{server.history}}<em>（{{server.latest | getXQDay}}）</em></span>\n      <!--当点击置顶后，给i添加.istop，并将title修改为"取消置顶"-->\n      <span class="top" data-id="{{server.ip}}" data-top="{{server.top}}"><i class="u-icon-top istop" title="{{server.isTop | getTopText}}">置顶</i></span>\n      <span class="fav" data-id="{{server.ip}}" data-collect="{{server.isCollect}}"><i class="u-icon-fav"  title="{{server.isCollect | getCollectText}}">收藏</i></span>\n      <span class="feed" data-id="{{server.ip}}" data-feed="{{server.isFeed}}"><i class="u-icon-feed" title="暂未开放">订阅</i></span>\n  </li>\n{{/each}}';
    var allData = [];
  
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
  
  
    //匹配对应的服务器
    var doSearch = function(serverName){
      if(!serverName){
        return allData;
      }
      var result = [];
      for(var index = 0; index < allData.length; index++){
        var server = allData[index];
        if(server.area.indexOf(serverName) != -1 || server.name.indexOf(serverName) != -1){
          result.push(server)
        }
      }
      return result;
    }
    
    //获取服务器列表
    var getServerList = function(serverName, cb, forceFresh){
      if(allData.length && !forceFresh){
        return cb && cb({serverList: doSearch(serverName)});
      }
      jQuery.get("/api/server/list.php", function(data){
        data = JSON.parse(data);
        allData = doSort(data);
        return cb && cb({serverList:allData});
      });
    }
    
    //置顶
    var letServerTop = function(ip, isTop, cb){
      jQuery.get("/api/server/action.php", {
        do: 'top',
        serverip: ip,
        value: ((isTop + "") == "1" ? 0 : 1)
      }, cb)
    }
            
    //收藏
    var letServerFav = function(ip, isCollect, cb){
      jQuery.get("/api/server/action.php", {
        do: 'collect',
        serverIp: ip,
        value: ((isCollect + "") == "1" ? 0 : 1)
      }, cb)
    }
    //订阅
    var letServerFeed = function(ip, isFeed,cb){
      return;
      jQuery.get("/api/server/action.php", {
        do: 'feed',
        serverIp: ip,
        value: ((isFeed + "") == "1" ? 0 : 1)
      }, cb)
    }
    
    jQuery(function($){
      var template = window.template;
              
      template.helper('getNormalClass', function (server) {
        if(server.isTop || server.isCollect){
          return;
        }
        return "app-servers-list-item-normal";
      });
      
      template.helper('getTopText', function (isTop) {
        return isTop ? "取消置顶" : "置顶";
      });
      
      template.helper('getStatusText', function (status) {
        return ['畅通', '爆满', '维护'][status-1] || '未知';
      });
      template.helper('getXQDay', function (day) {
        return [
          "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"
        ][new Date(day).getDay()]
      });
      template.helper('getCollectText', function (isCollect) {
        return isCollect ? "取消收藏" : "收藏";
      });
      
      //待编译源码
      var serverItemsRender = template.compile(tSource);
      
      //邦定事件
      var bindUserActionForServerItem = function(){
        //置顶
        $("#app-servers-list").find(".app-servers-list-item .top").click(function(){
          letServerTop($(this).data('id'), $(this).data('top'), function(){refreshServerList(true)})
        });
        //收藏
        $("#app-servers-list").find(".app-servers-list-item .fav").click(function(){
          letServerFav($(this).data('id'), $(this).data('collect'), function(){refreshServerList(true)})
        });
        //订阅
        $("#app-servers-list").find(".app-servers-list-item .feed").click(function(){
          letServerFeed($(this).data('id'), $(this).data('feed'), function(){refreshServerList(true)})
        });
      };
      
      //刷新页面列表
      var refreshServerList = function(forceFresh){
        var searchText = document.getElementById("search_txt").value;
        searchText = searchText.replace(/\s/g, "");
        getServerList(searchText, function(data){
          $("#app-servers-list").html(serverItemsRender(data));
          bindUserActionForServerItem();
        }, forceFresh);
      };
      
      //搜索按钮
      $("#search_btn").click(function(){refreshServerList(false);});
      
      $("#search_txt").keyup(function(e){
        if(e.keyCode === 13){
          e.preventDefault();
          refreshServerList(false);
        }
      });
      
      refreshServerList(true);
	});  
})