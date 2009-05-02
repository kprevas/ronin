package gw.db

uses java.sql.Connection

class ConnectionWrapper implements Connection {

	delegate _conn represents Connection

	construct(conn : Connection) {
		_conn = conn
	}
	
	override function close() {
		if(_conn.AutoCommit) {
			_conn.close()
		}
	}

}