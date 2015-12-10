<?php

require_once '../../source/class/class_core.php';
require_once '../../source/function/function_core.php';

$discuz = C::app();
$discuz->init();

if(empty($_G['uid'])) {
    $data = array();
    $data['msg'] = '请先登录';
    $data['code'] = 1;
    json_output($data);
}

$uid = intval($_G['uid']);
$do = isset($_GET['do']) ? trim($_GET['do']) : '';
if (!$do || !in_array($do, array("top", "collect", "subscribe"))) {
    $data = array();
    $data['msg'] = '参数错误';
    $data['code'] = 2;
    json_output($data);
}

$serverid = isset($_GET['serverid']) ? $_GET['serverid'] : '';
if (!$serverid) {
    $data = array();
    $data['msg'] = '参数错误';
    $data['code'] = 2;
    json_output($data);
}

$value = isset($_GET['value']) ? intval($_GET['value']) : 0;
if (!in_array($value, array(0, 1))) {
    $data = array();
    $data['msg'] = '参数错误';
    $data['code'] = 2;
    json_output($data);
}

$serverinfo = C::t('server')->fetch($serverid);
if (empty($serverinfo)) {
    $data = array();
    $data['msg'] = '参数错误';
    $data['code'] = 3;
    json_output($data);
}

$filed = "is".$do;
if ($do == "collect" || $do == "subscribe") {
    if ($_G['groupid'] != 22) {
        $data = array();
        $data['msg'] = 'VIP用户才可以进行此操作,先请开通VIP';
        $data['code'] = 3;
        json_output($data);
    }
} else {
    $count = C::t('server_member')->fetch_user_istop_count($uid);
    if ($_G['groupid'] != 22 && $count > 0 && $value == 1) {
        if ($_G['groupid'] != 22) {
            $data = array();
            $data['msg'] = '非VIP用户只能置顶一条,,先请开通VIP即可无限置顶';
            $data['code'] = 4;
            json_output($data);
        }
    }
}

if (C::t('server_member')->fetch_by_serverid_and_uid($serverid, $uid)) {
    if ($do == 'collect' && $value == 1) {
        $backgroundcolor = urldecode($_GET['backgroundcolor']);
        if (strlen($backgroundcolor) != 7) {
             $data = array();
             $data['msg'] = '颜色参数不正确';
             $data['code'] = 5;
             json_output($data);
        }
        C::t('server_member')->update_collect_by_serverid_and_uid($serverid, $uid, $backgroundcolor, $value);
    } else {
        C::t('server_member')->update_action_by_serverid_and_uid($serverid, $uid, $filed, $value);
    }
} else {
    if ($do == 'collect' && $value == 1) {
        $backgroundcolor = $_GET['backgroundcolor'];
        if (strlen($backgroundcolor) != 7) {
            $data = array();
            $data['msg'] = '颜色参数不正确';
            $data['code'] = 4;
            json_output($data);
        }
        C::t('server_member')->insert(array("server_id" => $serverid,
                "uid" => $uid,
                "backgroundcolor" => $backgroundcolor,
                 "iscollect" => 1,
                "acttime" => date("Y-m-d H:i:s")));
    } else {
        C::t('server_member')->insert(array("server_id" => $serverid,
                "uid" => $uid,
                 $filed => $value,
                'acttime' => date("Y-m-d H:i:s")));
    }
}

$data = array();
$data['msg'] = '操作成功';
$data['code'] = 0;
json_output($data);

function json_output($data) {
    echo json_encode($data);
    exit();
}