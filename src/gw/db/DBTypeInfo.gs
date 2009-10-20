package gw.db

uses java.sql.*
uses java.util.*
uses java.lang.CharSequence
uses gw.config.*
uses gw.lang.reflect.*
uses gw.lang.reflect.gs.*
uses gw.lang.parser.*
uses gw.util.concurrent.LazyVar
uses gw.lang.reflect.MethodInfoBuilder
uses gw.lang.reflect.IPropertyInfo

internal class DBTypeInfo extends BaseTypeInfo {

	var _properties : Map<String, IPropertyInfo>
	var _methods : List<IMethodInfo>
	var _arrayProperties = new LazyVar<Map<String, IPropertyInfo>>() {
		override function init() : Map<String, IPropertyInfo> {
			return makeArrayProperties()
		}
	}
	var _joinArrayMethods = new LazyVar<Map<String, IMethodInfo>>() {
	  override function init() : Map<String, IMethodInfo> {
	    return makeJoinArrayMethods()
	  }
	}
	var _getMethod : IMethodInfo
	var _idMethod : IMethodInfo
	var _updateMethod : IMethodInfo
	var _deleteMethod : IMethodInfo
	var _countMethod : IMethodInfo
	var _countWithSqlMethod : IMethodInfo
	var _findMethod : IMethodInfo
	var _findSortedMethod : IMethodInfo
	var _findPagedMethod : IMethodInfo
	var _findSortedPagedMethod : IMethodInfo
	var _findWithSqlMethod : IMethodInfo
	var _newProperty : IPropertyInfo
	var _ctor : IConstructorInfo
	
	var _fm : FeatureManager
	
	construct(type : DBType) {
		super(type)
		
		_getMethod = new MethodInfoBuilder().withName("fromID").withStatic()
			.withParameters({new ParameterInfoBuilder().withName("id").withType(long)})
			.withReturnType(type)
			.withCallHandler(\ ctx, args -> selectById(args[0] as java.lang.Long)).build(this)
		_idMethod = new MethodInfoBuilder().withName("toID")
			.withReturnType(long)
			.withCallHandler(\ ctx, args -> ctx["id"] ).build(this)
		_updateMethod = new MethodInfoBuilder().withName("update")
			.withCallHandler(\ ctx, args -> {
			  (ctx as IHasImpl)._impl.update()
			  return null
			}).build(this)
		_deleteMethod = new MethodInfoBuilder().withName("delete")
			.withCallHandler(\ ctx, args -> {
			  (ctx as IHasImpl)._impl.delete()
			  return null
			}).build(this)
		_countWithSqlMethod = new MethodInfoBuilder().withName("countWithSql").withStatic()
		    .withParameters({new ParameterInfoBuilder().withName("sql").withType(String)})
		    .withReturnType(int)
		    .withCallHandler(\ ctx, args -> countFromSql(args[0] as String)).build(this)
		_countMethod = new MethodInfoBuilder().withName("count").withStatic()
		    .withParameters({new ParameterInfoBuilder().withName("template").withType(type)})
		    .withReturnType(int)
		    .withCallHandler(\ ctx, args -> countFromTemplate((args[0] as IHasImpl)._impl)).build(this)
		_findWithSqlMethod = new MethodInfoBuilder().withName("findWithSql").withStatic()
			.withParameters({new ParameterInfoBuilder().withName("sql").withType(String)})
			.withReturnType(List.Type.getGenericType().getParameterizedType({type}))
			.withCallHandler(\ ctx, args -> findWithSql(args[0] as String)).build(this)
		_findMethod = new MethodInfoBuilder().withName("find").withStatic()
		    .withParameters({new ParameterInfoBuilder().withName("template").withType(type)})
		    .withReturnType(List.Type.getGenericType().getParameterizedType({type}))
		    .withCallHandler(\ ctx, args -> findFromTemplate((args[0] as IHasImpl)._impl, null, false, -1, -1)).build(this)
		_findSortedMethod = new MethodInfoBuilder().withName("findSorted").withStatic()
		    .withParameters({new ParameterInfoBuilder().withName("template").withType(type),
		    	new ParameterInfoBuilder().withName("sortProperty").withType(IPropertyInfo),
		    	new ParameterInfoBuilder().withName("ascending").withType(boolean)})
		    .withReturnType(List.Type.getGenericType().getParameterizedType({type}))
		    .withCallHandler(\ ctx, args -> findFromTemplate((args[0] as IHasImpl)._impl, args[1] as IPropertyInfo, args[2] as boolean, -1, -1)).build(this)
		_findPagedMethod = new MethodInfoBuilder().withName("findPaged").withStatic()
		    .withParameters({new ParameterInfoBuilder().withName("template").withType(type),
		    	new ParameterInfoBuilder().withName("pageSize").withType(int),
		    	new ParameterInfoBuilder().withName("offset").withType(int)})
		    .withReturnType(List.Type.getGenericType().getParameterizedType({type}))
		    .withCallHandler(\ ctx, args -> findFromTemplate((args[0] as IHasImpl)._impl, null, false, args[1] as int, args[2] as int)).build(this)
		_findSortedPagedMethod = new MethodInfoBuilder().withName("findSortedPaged").withStatic()
		    .withParameters({new ParameterInfoBuilder().withName("template").withType(type),
		    	new ParameterInfoBuilder().withName("sortProperty").withType(IPropertyInfo),
		    	new ParameterInfoBuilder().withName("ascending").withType(boolean),
		    	new ParameterInfoBuilder().withName("pageSize").withType(int),
		    	new ParameterInfoBuilder().withName("offset").withType(int)})
		    .withReturnType(List.Type.getGenericType().getParameterizedType({type}))
		    .withCallHandler(\ ctx, args -> findFromTemplate((args[0] as IHasImpl)._impl, args[1] as IPropertyInfo, args[2] as boolean, args[3] as int, args[4] as int)).build(this)

		_newProperty = new PropertyInfoBuilder().withName("_New").withType(boolean)
			.withWritable(false).withAccessor(new IPropertyAccessor() {
				override function getValue(ctx : Object) : boolean {
				    return (ctx as IHasImpl)._impl.IsNew
				}
				override function setValue(ctx : Object, value : Object) {}
			}).build(this)
		_properties = new HashMap<String, IPropertyInfo>()
		using(var con = connect()) {
			using(var cols = con.MetaData.getColumns(null, null, type.RelativeName, null)) {
				cols.first()
				while(!cols.isAfterLast()) {
					var col = cols.getString("COLUMN_NAME")
					var colType = cols.getInt("DATA_TYPE")
					var prop = makeProperty(col, colType)
					_properties.put(prop.Name, prop)
					cols.next()
				}
			}
		}

		_ctor = new ConstructorInfoBuilder()
			.withConstructorHandler(new IConstructorHandler() {
				override function newInstance(args : Object[]) : Object {
					return create()
				}
				override function newInstance(encl : IGosuClassInstance, args : Object[]) : Object {
					return newInstance(args)
				}
			})
			.build(this)
			
	  _methods = {_getMethod, _idMethod, _updateMethod, _deleteMethod, _countWithSqlMethod, _countMethod,
			_findWithSqlMethod, _findMethod,
			_findSortedMethod, _findPagedMethod, _findSortedPagedMethod}
			
	  CommonServices.getEntityAccess().addEnhancementMethods(type, _methods)
	  CommonServices.getEntityAccess().addEnhancementProperties(type, _properties, true)
	}
	
	override property get Properties() : List<IPropertyInfo> {
		var props = new ArrayList<IPropertyInfo>(_properties.values())
		props.addAll(_arrayProperties.get().values())
		props.add(_newProperty)
		return props
	}
	
	override function getProperty(propName : CharSequence) : IPropertyInfo {
	    if(propName == "_New") {
	        return _newProperty
	    }
		var prop = _properties.get(propName.toString())
		if(prop == null) {
			prop = _arrayProperties.get().get(propName.toString())
		}
		return prop
	}
	
	override function getRealPropertyName(propName : CharSequence) : CharSequence {
		for(key in _properties.keySet()) {
			if(key.equalsIgnoreCase(propName)) {
				return key
			}
		}
		for(key in _arrayProperties.get().keySet()) {
			if(key.equalsIgnoreCase(propName)) {
				return key
			}
		}
		return propName
	}
	
	override property get Methods() : List<IMethodInfo> {
		return _methods
	}
	
	override function getMethod(methodName : CharSequence, params : IType[]) : IMethodInfo {
		if(methodName == "fromID" and params == {long}) {
			return _getMethod
		} else if(methodName == "toID" and params.IsEmpty) {
		    return _idMethod
		} else if(methodName == "update" and params.IsEmpty) {
			return _updateMethod
		} else if(methodName == "delete" and params.IsEmpty) {
			return _deleteMethod
		} else if(methodName == "findWithSql" and params == {String}) {
			return _findWithSqlMethod
		} else if(methodName == "find" and params == {OwnersType}) {
		    return _findMethod
		} else if(methodName == "findSorted" and params == {OwnersType, IPropertyInfo, boolean}) {
		    return _findSortedMethod
		} else if(methodName == "findPaged" and params == {OwnersType, int, int}) {
		    return _findPagedMethod
		} else if(methodName == "findSortedPaged" and params == {OwnersType, IPropertyInfo, boolean, int, int}) {
		    return _findSortedPagedMethod
		} else if(methodName == "count" and params == {OwnersType}) {
		    return _countMethod
		} else if(methodName == "countWithSql" and params == {String}) {
		    return _countWithSqlMethod
		}
		return null
	}
	
	override function getCallableMethod(methodName : CharSequence, params : IType[]) : IMethodInfo {
		return getMethod(methodName, params)
	}
	
	override property get Constructors() : List<IConstructorInfo> {
		return {_ctor}
	}
	
	override function getConstructor(params : IType[]) : IConstructorInfo {
		if(params.IsEmpty) {
			return _ctor
		} else {
			return null
		}
	}
	
	override function getCallableConstructor(params : IType[]) : IConstructorInfo {
		return getConstructor(params)
	}
	
	private function connect() : Connection {
		return (OwnersType as IDBType).Connection.connect()
	}
	
	internal function selectById(id : long) : CachedDBObject {
		var obj : CachedDBObject = null
		using(var con = connect(),
			var statement = con.createStatement()) {
			statement.executeQuery("select * from \"${OwnersType.RelativeName}\" where \"id\" = ${id}")
			using(var result = statement.ResultSet) {
				if(result.first()) {
					obj = buildObject(result)
				}
			}
		}
		return obj
	}
	
	internal function findFromTemplate(template : CachedDBObject, sortColumn : IPropertyInfo, ascending : boolean, limit : int, offset : int) : List<CachedDBObject> {
	    var query = new java.lang.StringBuilder("select * from \"${OwnersType.RelativeName}\"")
	    addWhereClause(query, template)
	    if(sortColumn != null) {
	        query.append(" order by \"${sortColumn.Name}\" ${ascending ? "ASC" : "DESC"}, \"id\" ASC")
	    } else {
	        query.append(" order by \"id\" ASC")
	    }
	    if(limit != -1) {
	        query.append(" limit ${limit} offset ${offset}")
	    }
	    return findWithSql(query.toString())
	}
	
	internal function countFromTemplate(template : CachedDBObject) : int {
	    var query = new java.lang.StringBuilder("select count(*) as count from \"${OwnersType.RelativeName}\"")
	    addWhereClause(query, template)
	    return countFromSql(query.toString())
	}
	
	private function countFromSql(query : String) : int {
		using(var con = connect(),
			var statement = con.createStatement()) {
			statement.executeQuery(query)
			using(var result = statement.ResultSet) {
				if(result.first()) {
					return result.getInt("count")
				}
			}
		}
		return 0
	}
	
	private function addWhereClause(query : java.lang.StringBuilder, template : CachedDBObject) {
	    var whereClause = new ArrayList<String>()
	    if(template != null) {
		    for(columnName in template.Columns.keySet()) {
		        var columnVal = template.Columns[columnName]
		        if(columnVal != null) {
		            var value : String
	                value = "'${columnVal.toString().replace("'", "''")}'"
		            whereClause.add("\"${columnName}\" = ${value}")
		        }
		    }
	    }
	    if(not whereClause.Empty) {
			query.append(" where ${whereClause.join(" and ")}")
	    }
	}
	
	internal function findInDb(props : List<IPropertyInfo>, args : Object[]) : List<CachedDBObject> {
		var whereClause = new ArrayList<String>()
		props.eachWithIndex(\ p, i -> {
			if(p typeis DBPropertyInfo) {
				var value : String
				if(p.ColumnName.endsWith("_id")) {
					value = (typeof args[i]).TypeInfo.getProperty("id").Accessor.getValue(args[i])
				} else {
					value = "'${args[i].toString().replace("'", "''")}'"
				}
				var colName = p.ColumnName
				whereClause.add("\"${colName}\" = ${value}")
			}
		})
		return findWithSql("select * from \"${OwnersType.RelativeName}\" where ${whereClause.join(" and ")}")
	}
	
	internal function findWithSql(sql : String) : List<CachedDBObject> {
		var objs = new ArrayList<CachedDBObject>()
		using(var con = connect(),
			var statement = con.createStatement()) {
			statement.executeQuery(sql)
			using(var result = statement.ResultSet) {
				if(result.first()) {
					objs = buildObjects(result)
				}
			}
		}
		return objs.freeze()
	}
	
	private function buildObjects(result : ResultSet) : ArrayList<CachedDBObject> {
		var objs = new ArrayList<CachedDBObject>()
		while(!result.isAfterLast()) {
			objs.add(buildObject(result))
			result.next()
		}
		return objs
	}
	
	private function buildObject(result : ResultSet) : CachedDBObject {
		var obj = new CachedDBObject(OwnersType.RelativeName, OwnersType.TypeLoader as DBTypeLoader, (OwnersType as DBType).Connection, false)
		for(prop in Properties.whereTypeIs(DBPropertyInfo)) {
		    var resultObject = result.getObject("${OwnersType.RelativeName}.${prop.ColumnName}")
		    if(prop.ColumnName == "id") {
		        obj.Columns.put(prop.ColumnName, resultObject as long)
		    } else if (resultObject typeis java.io.BufferedReader) {
		        obj.Columns.put(prop.ColumnName, resultObject.readAll())
		    } else if (resultObject typeis java.sql.Clob) {
		        obj.Columns.put(prop.ColumnName, new java.io.BufferedReader(resultObject.CharacterStream).readAll())
		    } else {
				obj.Columns.put(prop.ColumnName, resultObject)
		    }
		}
		return obj
	}
	
	internal function create(): CachedDBObject {
		return new CachedDBObject(OwnersType.RelativeName, OwnersType.TypeLoader as DBTypeLoader, (OwnersType as DBType).Connection, true)
	}
	
	private function makeArrayProperties() : Map<String, IPropertyInfo> {
		var arrayProps = new HashMap<String, IPropertyInfo>()
		for(fkTable in (OwnersType as DBType).Connection.getFKs(OwnersType.RelativeName)) {
			var arrayProp = makeArrayProperty(fkTable)
			arrayProps.put(arrayProp.Name, arrayProp)
		}
		for(joinTable in (OwnersType as DBType).Connection.getJoins(OwnersType.RelativeName)) {
		  var joinProp = makeJoinProperty(joinTable)
		  arrayProps.put(joinProp.Name, joinProp)
		}
		return arrayProps
	}
	
	private function makeJoinArrayMethods() : Map<String, IMethodInfo> {
	  return {}
	}

	private function makeProperty(propName : String, type : int) : DBPropertyInfo {
		return new DBPropertyInfo(this, propName, type)
	}
	
	private function makeArrayProperty(fkTable : String) : IPropertyInfo {
		var namespace = (OwnersType as DBType).Connection.Namespace
		var fkType = OwnersType.TypeLoader.getType("${namespace}.${fkTable}")
		return new PropertyInfoBuilder().withName("${fkTable}s").withType(List.Type.getGenericType().getParameterizedType({fkType}))
			.withWritable(false).withAccessor(new IPropertyAccessor() {
				override function getValue(ctx : Object) : Object {
					return (fkType.TypeInfo as DBTypeInfo).findInDb({fkType.TypeInfo.getProperty(outer.OwnersType.RelativeName)}, {ctx})
				}
				override function setValue(ctx : Object, value : Object) {
				}
			}).build(this)
	}
	
	private function makeJoinProperty(join : Join) : IPropertyInfo {
		var namespace = (OwnersType as DBType).Connection.Namespace
		var fkType = OwnersType.TypeLoader.getType("${namespace}.${join.TargetTable}")
		return new PropertyInfoBuilder().withName(join.PropName).withType(List.Type.getGenericType().getParameterizedType({fkType}))
			.withWritable(false).withAccessor(new IPropertyAccessor() {
				override function getValue(ctx : Object) : Object {
				  var j = join.JoinTable
				  var t = join.TargetTable
				  var o = OwnersType.RelativeName
				  if(t == o) {
				    o += "_src"
				    t += "_dest"
				  }
				  var id : String = (typeof ctx).TypeInfo.getProperty("id").Accessor.getValue(ctx)
					var result = (fkType.TypeInfo as DBTypeInfo).findWithSql(
					  "select * from \"${join.TargetTable}\", \"${j}\" as j where j.\"${t}_id\" = \"${join.TargetTable}\".\"id\" and j.\"${o}_id\" = ${id}"
					)
					return new JoinResult(result, (OwnersType as DBType).Connection, j, o, t, id)
				}
				override function setValue(ctx : Object, value : Object) {
				}
			}).build(this)
	}
	
}