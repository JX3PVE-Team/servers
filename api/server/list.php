<?php

require_once '../../source/class/class_core.php';
$discuz = C::app();
$discuz->init();
$servers = C::t('server')->fetch_all_server();

$servermembers = array();
if(!empty($_G['uid'])) {
    $uid = intval($_G['uid']);
    $servermembers = C::t('server_member')->fetch_servers_by_uid($uid);
}

$list = array();
foreach ($servers as $k => $v) {
    list($latest, $history) = explode(",", $v['history']);
    $temp = array();
    $temp['id'] =  intval($v['server_id']);
    $temp['area'] = $v['area'];
    $temp['name'] = $v['name'];
    $temp['status'] = intval($v['status']);
    $temp['latest'] = $latest;
    $temp['history'] = $history;
    $temp['ip'] = $v['server_ip'];
    $temp['isTop'] = isset($servermembers[$v['server_id']]) ? intval($servermembers[$v['server_id']]['istop']) :  0;
    $temp['isCollect'] = isset($servermembers[$v['server_id']]) ? intval($servermembers[$v['server_id']]['iscollect']) :  0;
    $temp['isSubscribe'] = isset($servermembers[$v['server_id']]) ? intval($servermembers[$v['server_id']]['issubscribe']):  0;
    $temp['backgroundcolor'] = isset($servermembers[$v['server_id']]) ? $servermembers[$v['server_id']]['backgroundcolor']: '';
    $list[] = $temp;
}

unset($ret);
unset($servermembers);

json_output(sortByCol($list, "isTop", SORT_DESC));


function sortByCol($arr, $keyname, $dir = SORT_ASC) {
    return sortByMultiCols($arr, array($keyname => $dir));
}

function sortByMultiCols($rowset, $args) {
    $sortArr = array();
    $sortRule = '';

    foreach ($args as $sortField => $sortDir) {
        foreach ($rowset as $offset => $row) {
            $sortArr[$sortField][$offset] = $row[$sortField];
        }
        $sortRule .= '$sortArr[\'' . $sortField . '\'], ' . $sortDir . ', ';
    }
    if (empty($sortArr) || empty($sortRule)) {
        return $rowset;
    }
    eval('array_multisort(' . $sortRule . '$rowset);');
    return $rowset;
}

function json_output($data) {
    echo json_encode($data);
    exit();
}