/***
 Author: ec.huyinghuan@gmail.com
 Date: 2015-12-03
*/
H.ready(['jquery', 'template'],function(){
    //获取服务器列表
    var getServerList = function(serverName, cb){  
      
    }
    //置顶
    var letServerTop = function(ip, cb){
      
    }
    //收藏
    var letServerFav = function(ip, cb){
      
    }
    //订阅
    var letServerFeed = function(ip, cb){
      
    }
    
    jQuery(function($){
      //待编译源码
      var serverItemsRender = template('template_server_items');
      
      //邦定事件
      var bindUserActionForServerItem = function(){
        //置顶
        $("#app-servers-list").find(".app-servers-list-item .top").click(function(){
          letServerTop($(this).data('id'), function(){refreshServerList()})
        });
        //收藏
        $("#app-servers-list").find(".app-servers-list-item .fav").click(function(){
          letServerFav($(this).data('id'), function(){refreshServerList()})
        });
        //订阅
        $("#app-servers-list").find(".app-servers-list-item .feed").click(function(){
          letServerFeed($(this).data('id'), function(){refreshServerList()})
        });
      };
      
      //刷新页面列表
      var refreshServerList = function(){
        var searchText = document.getElementById("search_txt").value;
        searchText = searchText.replace(/\s/g, "");
        getServerList(searchText, function(data){
          $("#app-servers-list").html(serverItemsRender(data));
        });
      };
      
      //搜索按钮
      $("#search_btn").click(function(){refreshServerList();})
      
      $("#search_txt").keyup(function(e){
        if(e.keyCode === 13){
          e.preventDefault();
          refreshServerList();
        }
      })
	});  
})