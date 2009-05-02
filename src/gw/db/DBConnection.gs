package gw.db

uses java.lang.*
uses java.util.*
uses java.sql.*
uses java.net.URL
uses java.net.URLClassLoader
uses gw.lang.reflect.*
uses gw.lang.reflect.java.*
uses gw.lang.reflect.module.*
uses gw.lang.parser.*
uses gw.util.AutoMap

internal class DBConnection {

	var _connectURL : String
	var _namespace : String as Namespace
	var _transaction : ThreadLocal<Connection> as Transaction
	
	var _fks = new AutoMap<String, Set<String>>(\ s -> new HashSet<String>())

	construct(url : String, __namespace : String) {
		_connectURL = url
		_namespace = __namespace
		_transaction = new ThreadLocal<Connection>()

	}
	
	function connect() : Connection {
		var trans = _transaction.get()
		if(trans == null) {
			return DriverManager.getConnection(_connectURL)
		} else {
			return trans
		}
	}
	
	function getFKs(table : String) : Set<String> {
		return _fks[table]
	}
	
	property get AllTypeNames() : Set<String> {
		var typeNames = new HashSet<String>()
		using(var con = connect(),
			var resultSet = con.MetaData.getColumns(null, null, null, null)) {
			if(resultSet.first()) {
				while(!resultSet.isAfterLast()) {
					var tableName = resultSet.getString("TABLE_NAME")
					typeNames.add("${_namespace}.${tableName}")
					var colName = resultSet.getString("COLUMN_NAME")
					if(colName.endsWith("_id")) {
						_fks[colName.substring(0, colName.length - 3)].add(tableName)
					}
					resultSet.next()
				}
			}
		}
		return typeNames
	}

}