<?php

/**
 *      [Discuz!] (C)2001-2099 Comsenz Inc.
 *      This is NOT a freeware, use is subject to license terms
 *
 *      $Id: table_common_member.php 31849 2012-10-17 04:39:16Z zhangguosheng $
 */

if(!defined('IN_DISCUZ')) {
	exit('Access Denied');
}

class table_server_member extends discuz_table_archive
{
	public function __construct() {

		$this->_table = 'server_member';
		$this->_pk    = 'id';
		parent::__construct();
	}

    public function fetch_user_istop_count($uid) {
        return DB::result_first('SELECT COUNT(*) FROM %t WHERE istop=1 and uid = %d ', array($this->_table, $uid));
    }

    public function fetch_by_serverid_and_uid($serverid, $uid) {
        return DB::fetch_first('SELECT * FROM %t WHERE server_id=%s and uid = %d ', array($this->_table, $serverid, $uid));
    }

    public function update_collect_by_serverid_and_uid($serverid, $uid, $color, $value) {
        $acttime = date("Y-m-d H:i:s");
        return DB::query('UPDATE %t SET iscollect = %d, backgroundcolor = %s, acttime = %s WHERE  server_id = %s AND uid= %d ',
                array($this->_table, $value, $color, $acttime, $serverid, $uid));
    }

    public function update_action_by_serverid_and_uid($serverid, $uid, $filed, $value) {
        $acttime = date("Y-m-d H:i:s");
        return DB::query('UPDATE %t SET '.$filed.' = %d , acttime = %s WHERE  server_id = %s AND uid= %d',
                array($this->_table, $value, $acttime, $serverid, $uid));
    }

    public function fetch_servers_by_uid($uid) {
        return DB::fetch_all('SELECT * FROM %t where uid = %s ', array($this->_table, $uid), "server_id");
    }

}

?>