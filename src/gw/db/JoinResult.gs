package gw.db

uses java.lang.*
uses java.util.*

class JoinResult implements List<CachedDBObject> {

  delegate _result : List<CachedDBObject> represents List<CachedDBObject>
  var _conn : DBConnection
  var _joinTableName : String
  var _srcTableName : String
  var _targetTableName : String
  var _id : String
  
  construct(result : List<CachedDBObject>, conn : DBConnection, joinTableName : String, 
    srcTableName : String, targetTableName : String, id : String) {
    _result = result
    _conn = conn
    _joinTableName = joinTableName
    _srcTableName = srcTableName
    _targetTableName = targetTableName
    _id = id
  }
  
  override function add(obj : CachedDBObject) : boolean {
    using(var con = _conn.connect(),
			var statement = con.createStatement()) {
      statement.executeUpdate("insert into \"${_joinTableName}\" (\"${_srcTableName}_id\", \"${_targetTableName}_id\") values (${_id}, ${obj["id"]})")
    }
    return true
  }
  
  override function addAll(objs : Collection<CachedDBObject>) : boolean {
    var query = new StringBuilder("insert into \"${_joinTableName}\" (\"${_srcTableName}_id\", \"${_targetTableName}_id\") values ")
    for(obj in objs index i) {
      query.append("(${_id}, ${obj["id"]})")
      if(i < objs.Count - 1) {
        query.append(", ")
      }
    }
    using(var con = _conn.connect(),
			var statement = con.createStatement()) {
      statement.executeUpdate(query)
    }    
    return true
  }
  
  override function remove(obj : CachedDBObject) : boolean {
    using(var con = _conn.connect(),
			var statement = con.createStatement()) {
      var result = statement.executeQuery("select * from \"${_joinTableName}\" where \"${_srcTableName}_id\" = ${_id} and \"${_targetTableName}_id\" = ${obj["id"]} limit 1")
      if(result.first()) {
        var id = result.getLong("id")
        statement.executeUpdate("delete from \"${_joinTableName}\" where \"id\"=${id}")
        return true
      }
    }
    return false
  }
  
  override function clear() {
    using(var con = _conn.connect(),
			var statement = con.createStatement()) {
      statement.executeUpdate("delete from \"${_joinTableName}\" where \"${_srcTableName}_id\" = ${_id}")
    }
  }
  
  

}