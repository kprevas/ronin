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
uses gw.util.Pair
uses gw.util.AutoMap

internal class DBConnection {

	var _connectURL : String
	var _namespace : String as Namespace
	var _transaction : ThreadLocal<Connection> as Transaction
	
	var _fks = new AutoMap<String, Set<String>>(\ s -> new HashSet<String>())
	var _joins = new AutoMap<String, Set<Join>>(\ s -> new HashSet<Join>())
	
	var _typeNames : Set<String>

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
	
	function getJoins(table : String) : Set<Join> {
	  return _joins[table]
	}
	
	property get AllTypeNames() : Set<String> {
	  if(_typeNames == null) {
      _typeNames = new HashSet<String>()
      using(var con = connect(),
        var resultSet = con.MetaData.getColumns(null, null, null, null)) {
        if(resultSet.first()) {
          while(!resultSet.isAfterLast()) {
            var tableName = resultSet.getString("TABLE_NAME")
            if(tableName.contains("join_")) {
              var joinName : String = null
              if(not tableName.startsWith("join_")) {
                joinName = tableName.substring(0, tableName.indexOf("_"))
              }
              var lastUnderscore = tableName.lastIndexOf("_")
              var nextToLastUnderscore = tableName.lastIndexOf("_", lastUnderscore - 1)
              var firstTable = tableName.substring(nextToLastUnderscore + 1, lastUnderscore)
              var secondTable = tableName.substring(lastUnderscore + 1)
              _joins[firstTable].add(new Join() {
                :PropName = joinName == null ? secondTable + "s" : joinName,
                :TargetTable = secondTable,
                :JoinTable = tableName
              })
              if(firstTable != secondTable) {
                _joins[secondTable].add(new Join() {
                  :PropName = joinName == null ? firstTable + "s" : joinName,
                  :TargetTable = firstTable,
                  :JoinTable = tableName
                })
              }
            } else {
              _typeNames.add("${_namespace}.${tableName}")
              var colName = resultSet.getString("COLUMN_NAME")
              if(colName.endsWith("_id") and not colName.substring(0, colName.length - 3).contains("_")) {
                _fks[colName.substring(0, colName.length - 3)].add(tableName)
              }
            }
            resultSet.next()
          }
        }
      }
	  }
    return _typeNames
	}

}