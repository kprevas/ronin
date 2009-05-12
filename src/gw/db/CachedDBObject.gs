package gw.db

uses java.util.*
uses java.sql.Statement

internal class CachedDBObject implements IHasImpl {

	var _columns : Map<String, Object> as Columns
	var _tableName : String as TableName
	var _typeLoader : DBTypeLoader
	var _conn : DBConnection as Connection
	var _new : boolean as IsNew
	
	construct(__tableName : String, typeLoader : DBTypeLoader, conn : DBConnection, __new : boolean) {
		_columns = new HashMap<String, Object>()
		_tableName = __tableName
		_typeLoader = typeLoader
		_conn = conn
		_new = __new
	}
	
	function update() {
		using(var conn = _conn.connect(),
			var stmt = conn.createStatement()) {
			if(_new) {
				var keys = new ArrayList<String>()
				var values = new ArrayList<String>()
				_columns.eachKeyAndValue(\ k, v -> {
					keys.add(k)
					values.add("'${v.toString().replace("'", "''")}'")
				})
				stmt.executeUpdate("insert into \"${_tableName}\" (${keys.map(\k -> "\"${k}\"").join(", ")}) values (${values.join(", ")})", Statement.RETURN_GENERATED_KEYS)
				using(var result = stmt.GeneratedKeys) {
					if(result.first()) {
						_columns["id"] = result.getLong(1)
						_new = false
					}
				}
			} else {
				var attrs = new ArrayList<String>()
				_columns.eachKeyAndValue(\ k, v -> {
					if(k != "id") {
						var value = v == null ? "null" : "'${v.toString().replace("'", "''")}'"
						attrs.add("\"${k}\" = ${value}")
					}
				})
				stmt.execute("update \"${_tableName}\" set ${attrs.join(", ")} where \"id\" = '${_columns["id"]}'")
			}
		}
	}
	
	function delete() {
		using(var conn = _conn.connect(),
			var stmt = conn.createStatement()) {
			stmt.execute("delete from \"${_tableName}\" where \"id\" = '${_columns["id"]}'")
		}
	}
	
	override function toString() : String {
		return _columns as String
	}

	override property get _impl() : CachedDBObject {
		using(_typeLoader.AccessImpls) {
			return this
		}
	}
	
	override function equals(o : Object) : boolean {
	    if(typeof o == typeof this) {
	        var otherImpl = (o as IHasImpl)._impl
	        for(columnName in _columns.Keys) {
	            if(_columns[columnName] != null) {
	                var oc = otherImpl._columns[columnName]
	                if(otherImpl._columns[columnName] != _columns[columnName]) {
	                    return false
	                }
	            }
	        }
	        for(columnName in otherImpl._columns.Keys) {
	            if(otherImpl._columns[columnName] != null) {
	                if(otherImpl._columns[columnName] != _columns[columnName]) {
	                    return false
	                }
	            }
	        }
	        return true
	    }
	    return false
	}
	
	override function hashCode() : int {
	    var hashcode = _tableName.hashCode()
	    var columnNames = _columns.Keys.toList()
	    columnNames.sortBy( \ s -> s )
	    for(columnName in columnNames) {
	        if(_columns[columnName] != null) {
	            hashcode = hashcode * 17 + _columns[columnName].hashCode()
	        }
	    }
	    return hashcode
	}

}