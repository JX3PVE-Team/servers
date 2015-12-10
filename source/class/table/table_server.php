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

class table_server extends discuz_table_archive
{
	public function __construct() {

		$this->_table = 'server';
		$this->_pk    = 'server_id';
		parent::__construct();
	}

    public function fetch_all_server() {
        return DB::fetch_all('SELECT * FROM %t order by order_tag asc ', array($this->_table));
    }
}

?>