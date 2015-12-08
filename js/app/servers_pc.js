/***
 Author: ec.huyinghuan@gmail.com
 Date: 2015-12-03
 
 0 操作成功
1 需要登录
2 参数错误
3 需要VIP权限
4 普通用户置顶一个
5 颜色参数不正确
 
*/
H.ready(['jquery', 'template', 'color', 'jqColor'],function(){
  var tSource =  '<li class="app-servers-list-item app-servers-list-header">\n    <span class="daqu">大区</span>\n    <span class="fwq">服务器</span>\n    <span class="status">状态</span>\n    <span class="recent">最近开服记录</span>\n    <span class="history">上一次记录</span>\n    <span class="top">置顶</span>\n    <span class="fav">收藏</span>\n    <span class="feed">订阅</span>\n</li>\n<!--第一条被置顶的条目添加.app-servers-list-item-top-->\n<!--被收藏的条目添加.app-servers-list-item-fav，并且行内输出自定义的背景色-->\n<!--没有被收藏和置顶的才添加app-servers-list-item-normal，一旦添加了则移除这个类名-->\n<!--畅通状态1添加status-1-->\n<!--爆满状态2添加status-2-->\n<!--维护状态3添加status-3-->\n\n{{each serverList as server index}} \n  <li class="app-servers-list-item\n      {{if server.isTop}}app-servers-list-item-top{{/if}}\n      {{if server.isSubscribe}}app-servers-list-item-fav{{/if}}\n      {{server | getNormalClass}}\n      " \n      {{if isShowBGC(server)}}style="background-color:{{server.backgroundcolor}}"{{/if}}>\n      <span class="daqu">{{server.area}}</span>\n      <span class="fwq">{{server.name}}</span>\n      <span class="status status-{{server.status}}">{{server.status | getStatusText}}</span>\n      <span class="recent">{{server.latest}}<em>({{server.latest | getXQDay}})</em></span>\n      <span class="history">{{server.history}}<em>（{{server.latest | getXQDay}}）</em></span>\n      <!--当点击置顶后，给i添加.istop，并将title修改为"取消置顶"-->\n      <span class="top" data-id="{{server.id}}" data-top="{{server.isTop}}"><i class="u-icon-top {{if server.isTop}}istop{{/if}}" title="{{server.isTop | getTopText}}">置顶</i></span>\n      <span class="fav" data-id="{{server.id}}" data-collect="{{server.isCollect}}"><i class="u-icon-fav {{if server.isCollect}}isfav{{/if}}"  title="{{server.isCollect | getCollectText}}">收藏</i></span>\n      <span class="feed" data-id="{{server.id}}" data-feed="{{server.isFeed}}"><i class="u-icon-feed" title="暂未开放">订阅</i></span>\n  </li>\n{{/each}}';
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
    var letServerTop = function(id, isTop, cb){
      jQuery.get("/api/server/action.php", {
        do: 'top',
        serverid: id,
        value: ((isTop + "") == "1" ? 0 : 1)
      }, function(result){cb(JSON.parse(result))})
    }
    
   
    //订阅
    var letServerFeed = function(id, isFeed,cb){
      return;
      jQuery.get("/api/server/action.php", {
        do: 'feed',
        serverid: id,
        value: ((isFeed + "") == "1" ? 0 : 1)
      }, function(result){cb(JSON.parse(result))})
    }
    
    //收藏 
    var letServerFav = function(id, isFav, cb, color){
      if(!color){color = "#0084ff"}
      jQuery.get("/api/server/action.php", {
        do: 'collect',
        serverid: id,
        backgroundcolor: color,
        value: isFav
      }, function(result){cb(JSON.parse(result))});
    }
    
    jQuery(function($){
      var template = window.template;
      
      var showError = function(code){
         if(code === 0){
           $(".app-dialog").hide();
           refreshServerList(true)
           return;
         }
         $(".app-dialog").show();
         $(".app-dialog").find('.app-dialog-tips').hide();
         $(".app-dialog").find('#action_error_'+code).show();
      }
      var $colors = $('#background-color-input').colorPicker({
        customBG: '#0084ff',
        readOnly: true,
        init: function(elm, colors) { // colors is a different instance (not connected to colorPicker)
          elm.style.backgroundColor = elm.value;
          elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
        }
      })
      
      
      $(".app-dialog .app-dialog-fav-ui").find(".u-btn-go").click(function(){
        var id = $(this).data("id");
        var value = ($(this).data("isCollect") + "") == "1" ? 0 : 1;
        letServerFav(id, value, function(result){
          showError(result.code);
        }, $("#background-color-input").val())
      });
      
      $(".app-dialog .m-title .close").click(function(){
        $(".app-dialog").hide();
      });
      
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
      template.helper('isShowBGC', function(server){ return server.isCollect && server.backgroundcolor})
      //待编译源码
      var serverItemsRender = template.compile(tSource);
      
      //邦定事件
      var bindUserActionForServerItem = function(){
        //置顶
        $("#app-servers-list").find(".app-servers-list-item .top").click(function(){
          letServerTop($(this).data('id'), $(this).data('top'), function(result){showError(result.code);})
        });
        //收藏
        $("#app-servers-list").find(".app-servers-list-item .fav").click(function(){
          
          var id = $(this).data("id");
          var value = ($(this).data("collect") + "") == "1" ? 0 : 1;
          //取消收藏
          if(value === 0){
            letServerFav(id, value, function(result){
              showError(result.code);
            });
            return;
          }
          
          $(".app-dialog").show();
          $(".app-dialog").find('.app-dialog-tips').hide();
          $(".app-dialog").find(".app-dialog-fav-ui").show();
          $(".app-dialog .app-dialog-fav-ui").find(".u-btn-go").data("id", $(this).data('id')).data("isCollect", $(this).data('collect'))
        });
        //订阅
        $("#app-servers-list").find(".app-servers-list-item .feed").click(function(){
          letServerFeed($(this).data('id'), $(this).data('feed'), function(result){showError(result.code);})
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