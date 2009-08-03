package gw.db

uses gw.lang.reflect.*
uses gw.util.concurrent.LazyVar

internal class DBType extends TypeBase implements IDBType {

	var _tableName : String as RelativeName
	var _typeLoader : DBTypeLoader as TypeLoader
	var _typeInfo : LazyVar<DBTypeInfo>
	var _conn : DBConnection as Connection

	construct(tableName : String, __typeLoader : DBTypeLoader, conn : DBConnection) {
		_tableName = tableName
		_typeLoader = __typeLoader
		_conn = conn
		_typeInfo = new LazyVar<DBTypeInfo>() {
			override function init() : DBTypeInfo {
				return new DBTypeInfo(outer)
			}
		}
	}
	
	override property get Name() : String {
		return "${_conn.Namespace}.${_tableName}"
	}

	override property get Namespace() : String {
		return _conn.Namespace
	}

	override property get Supertype() : IType {
		return null
	}

	override property get Interfaces() : List<IType> {
		return {IHasImpl}
	}
	
	override property get TypeInfo() : ITypeInfo {
		return _typeInfo.get()
	}
	
}