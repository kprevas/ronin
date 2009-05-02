package gw.db

uses java.sql.*
uses java.util.*
uses gw.lang.reflect.*
uses gw.lang.parser.*

internal class DBPropertyInfo extends PropertyInfoBase {

	var _name : String as Name
	var _type : Type
	var _fk : boolean

	construct(ti : ITypeInfo) {
		super(ti)
	}

	construct(ti : DBTypeInfo, __name : String, __type : int) {
		super(ti)
		if(__name.endsWith("_id")) {
			_name = __name.substring(0, __name.length - 3)
			var namespace = (ti.OwnersIntrinsicType as IDBType).Connection.Namespace
			_type = ti.OwnersIntrinsicType.TypeLoader.getType("${namespace}.${_name}")
			_fk = true
		} else {
			_name = __name
			_type = name == "id" ? long : Util.getJavaType(__type)
		}
	}
	
	property get FeatureType() : IType {
		return _type
	}
	
	property get Readable() : boolean {
		return true
	}
	
	function isWritable(rel : IType) : boolean {
		return Name != "id"
	}
	
	property get ColumnName() : String {
		if(_fk) {
			return "${Name}_id"
		} else {
			return Name;
		}
	}
	
	property get Accessor() : IPropertyAccessor {
		return new IPropertyAccessor() {
			override function getValue(ctx : Object) : Object {
				if(_fk) {
					return (_type.TypeInfo as DBTypeInfo).selectById((ctx as IHasImpl)._impl.Columns[ColumnName] as java.lang.Long)
				} else {
					return (ctx as IHasImpl)._impl.Columns[ColumnName]
				}
			}
			
			override function setValue(ctx : Object, val : Object) {
				if(_fk) {
					(ctx as IHasImpl)._impl.Columns[ColumnName] = (val as IHasImpl)._impl.Columns["id"]
				} else {
					(ctx as IHasImpl)._impl.Columns[ColumnName] = val
				}
			}
		}
	}
	
	property get DeclaredAnnotations() : Map<IType, List<IAnnotationInfo>> {
		return {}
	}
	
	function hasAnnotation(t : IType) : boolean {
		return false
	}
	
}