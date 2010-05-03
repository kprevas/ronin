package gw.db

uses java.sql.*
uses java.util.*
uses gw.lang.reflect.*
uses gw.lang.parser.*

internal class DBPropertyInfo extends PropertyInfoBase {

	var _name : String as Name
	var _type : Type
	var _fk : boolean
	var _named : boolean

	construct(ti : ITypeInfo) {
		super(ti)
	}

	construct(ti : DBTypeInfo, __name : String, __type : int) {
		super(ti)
		if(__name.endsWith("_id")) {
		  var typeName : String
		  if(__name.substring(0, __name.length - 3).contains("_")) {
		    var underscorePos = __name.lastIndexOf("_", __name.length - 4)
		    _name = __name.substring(0, underscorePos)
		    typeName = __name.substring(underscorePos + 1, __name.length - 3)
		    _named = true
		  } else {
  			_name = __name.substring(0, __name.length - 3)
  			typeName = _name
		  }
			var namespace = (ti.OwnersType as IDBType).Connection.Namespace
			_type = ti.OwnersType.TypeLoader.getType("${namespace}.${typeName}")
			_fk = true
		} else {
			_name = __name
			_type = Name == "id" ? long : Util.getJavaType(__type)
		}
	}
	
	property get FeatureType() : IType {
		return _type
	}
	
	override property get Readable() : boolean {
		return true
	}
	// PL-9986
	function isReadable() : boolean {
		return true
	}
	
	override function isWritable(rel : IType) : boolean {
		return Name != "id"
	}
	
	property get ColumnName() : String {
		if(_fk) {
		  if(_named) {
		    return "${Name}_${_type.RelativeName}_id"
		  } else {
  			return "${Name}_id"
		  }
		} else {
			return Name;
		}
	}
	
	override property get Accessor() : IPropertyAccessor {
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
	
	override property get DeclaredAnnotations() : Map<IType, List<IAnnotationInfo>> {
		return {}
	}
	
	override function hasAnnotation(t : IType) : boolean {
		return false
	}
	
}