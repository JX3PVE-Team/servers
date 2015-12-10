<?php
header("Content-Type: text/html; charset=UTF-8");

class JX3ServerCheck {
	public static $status = array();
	public function check($ip, $port){
		if (!isset(self::$status[$ip])){
			$sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
			socket_set_nonblock($sock);
			socket_connect($sock,$ip, $port);
			socket_set_block($sock);
			self::$status[$ip] = socket_select($r = array($sock), $w = array($sock), $f = array($sock), 1);
		}
	}
	public function GetStatus(){
		return self::$status;
	}
}
$file = "/tmp/JX3ServerCheck";
if(time() - filemtime($file) > 30){
	$content = file_get_contents("http://jx3gc.autoupdate.kingsoft.com/jx3gc/zhcn/serverlist/serverlist.ini");
	$content = iconv("GBK", "UTF-8", $content);
	$line = explode("\n", $content);
	$array = array();
	$JX3 = new JX3ServerCheck();
	foreach ($line as $k => $v) {
		if($v){
			$arr = explode("\t", $v);
			$array[$arr[0]][] = $arr;
			$JX3->check($arr[3], $arr[4]);
		}
	}
	$serverIP = array();
	$return = array('server' => $array, 'status' => $JX3->GetStatus());
	$return = json_encode($return);
	file_put_contents($file, $return);
    foreach ($array as $key => $value) {
        if (strpos($key, "新服") !== false) {
            continue;
        }
        foreach($value as $serverInfo) {
            $ipNum = ipton($serverInfo[3]);
            $serverIP[$ipNum][$key][] =  $serverInfo[1];

            /*if (!isset($serverIP[$ipNum])) {
                echo $key."/".$serverInfo[1]."<br/>";
                $serverIP[$ipNum] = 1;
            }*/
        }
    }
    foreach ($serverIP as $k => $v) {
        foreach ($v as $key => $value) {
            echo $key."|".implode("/",$value)."<br/>";
        }
    }
} else {
	$return = json_decode(file_get_contents($file), true);
	$array = $return['server'];
	$serverIP = array();
	foreach ($array as $key => $value) {
		if (strpos($key, "新服") !== false) {
			continue;
		}
        foreach($value as $serverInfo) {
            $ipNum = ipton($serverInfo[3]);
            $serverIP[$ipNum][$key][] =  $serverInfo[1];

            /*if (!isset($serverIP[$ipNum])) {
                echo $key."/".$serverInfo[1]."<br/>";
                $serverIP[$ipNum] = 1;
            }*/
        }
	}
    foreach ($serverIP as $k => $v) {
        foreach ($v as $key => $value) {
            echo $key."|".implode("/",$value)."<br/>";
        }
    }
}
function ipton($ip) {
    $ip_arr=explode('.',$ip);//分隔ip段
    foreach ($ip_arr as $value)
    {
        $iphex=dechex($value);//将每段ip转换成16进制
        if(strlen($iphex)<2)//255的16进制表示是ff，所以每段ip的16进制长度不会超过2
        {
            $iphex='0'.$iphex;//如果转换后的16进制数长度小于2，在其前面加一个0
        //没有长度为2，且第一位是0的16进制表示，这是为了在将数字转换成ip时，好处理
        }
        $ipstr.=$iphex;//将四段IP的16进制数连接起来，得到一个16进制字符串，长度为8
    }
    return hexdec($ipstr);//将16进制字符串转换成10进制，得到ip的数字表示
}
