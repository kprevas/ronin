package gw.db

uses java.io.*
uses java.lang.*
uses java.util.*
uses java.sql.*
uses java.net.URL
uses java.net.URLClassLoader
uses gw.lang.reflect.*
uses gw.lang.reflect.java.*
uses gw.lang.reflect.gs.*
uses gw.lang.reflect.module.*
uses gw.lang.parser.*
uses gw.util.AutoMap

internal class DBTypeLoader implements IExtendedTypeLoader {

	var _module : IModule as Module
	
	var _types : Map<String, IType>
	
	var _repository : IGosuClassRepository
	
	var _accessImpls = new ThreadLocal<Boolean>()
	var _accessImplsLock : IReentrant as AccessImpls
	
	var _transactionTypes : AutoMap<String, TransactionType>
	
	var _initializedDrivers : Set<String> = new HashSet<String>()
	
	var _connInfos = new HashMap<String, DBConnection>()
	
	construct() {
		this(TypeSystem.getExecutionEnvironment(), {})
	}
	
	construct(env : IExecutionEnvironment, args : Map<String, String>) {
		_module = env.getCurrentModule()
		_types = {}

		_transactionTypes = new AutoMap<String, TransactionType>(\ ns -> new TransactionType(getConnInfo(ns), this))
		
		_accessImplsLock = new IReentrant() {
			override function enter() {
				_accessImpls.set(true)
			}
			override function exit() {
				_accessImpls.set(false)
			}
		}
		_repository = GosuShop.createFileSystemGosuClassRepository(_module.ResourcePath.toArray( new File[0] ), false)
	}
	
	private function initMysql() {
		if(!_initializedDrivers.contains("mysql")) {
			var classLoc = TypeSystem.getResource( "com/mysql/jdbc/Driver.class" ).toString()
			var driverUrl = new URL(classLoc.substring( 4, classLoc.length - "!/com/mysql/jdbc/Driver.class".length ))
			
			var cl = ClassLoader.getSystemClassLoader() as URLClassLoader
			var clazz = (URLClassLoader as IJavaType).BackingClass
			var method = clazz.getDeclaredMethod( "addURL", {(URL as IJavaType).BackingClass} )
			method.Accessible = true
			method.invoke( cl, {driverUrl} )
			var d = java.lang.Class.forName( "com.mysql.jdbc.Driver" )
			_initializedDrivers.add("mysql")
		}
	}
	
	private function initH2() {
		if(!_initializedDrivers.contains("h2")) {
			var classLoc = TypeSystem.getResource( "org/h2/Driver.class" ).toString()
			var driverUrl = new URL(classLoc.substring( 4, classLoc.length - "!/org/h2/Driver.class".length ))
			
			var cl = ClassLoader.getSystemClassLoader() as URLClassLoader
			var clazz = (URLClassLoader as IJavaType).BackingClass
			var method = clazz.getDeclaredMethod( "addURL", {(URL as IJavaType).BackingClass} )
			method.Accessible = true
			method.invoke( cl, {driverUrl} )
			var d = java.lang.Class.forName( "org.h2.Driver" )
			_initializedDrivers.add("h2")
		}
	}
	
	property get AllFullNamespaces() : Set<CharSequence> {
		return _repository.getAllNames(".dbc")
	}
	
	override property get AllNamespaces() : Set<CharSequence> {
	    var fullNs = AllFullNamespaces
	    var allNs = new HashSet<CharSequence>()
	    for(ns in fullNs) {
	        var nsComponentsArr = ns.toString().split("\\.")
	        for(i in nsComponentsArr.length) {
	            var nsName = ""
	            for(n in i + 1) {
	                if(n > 0) {
	                    nsName += "."
	                }
	                nsName += nsComponentsArr[n]
	            }
	            allNs.add(nsName)
	        }
	    }
	    return allNs
	}
	
	private function getConnInfo(namespace : String) : DBConnection {
		var connInfo = _connInfos.get(namespace)
		if(connInfo == null and AllFullNamespaces.contains(namespace)) {
			var connFile = new File(_repository.findResource("${namespace}.dbc").File)
			var connUrl = connFile.read()
			if(connUrl.startsWith("jdbc:mysql")) {
				initMysql()
			} else if(connUrl.startsWith( "jdbc:h2" )) {
			    initH2()
			}
			connInfo = new DBConnection(connUrl, namespace)
		}
		return connInfo
	}
	
	override property get AllTypeNames() : Set<CharSequence> {
		var typeNames = new HashSet<String>()
		for(namespace in AllFullNamespaces) {
			typeNames.add("${namespace}.Transaction")
			typeNames.addAll(getConnInfo(namespace).AllTypeNames)
		}		
		return typeNames		
	}
	
	override property get CaseSensitive() : boolean {
		return true
	}
	
	override property get HandledPrefixes() : List<String> {
		return {}
	}
	
	override property get InitializationErrors() : List<Throwable> {
		return {}
	}
	
	override function isNamespaceOfTypeHandled(typeName : String) : boolean {
		var lastDot = typeName.lastIndexOf(".")
		if(lastDot == -1) {
			return false
		}
		return AllFullNamespaces.contains(typeName.substring(0, lastDot))
	}
	
	override function getIntrinsicType(clazz : java.lang.Class) : IType {
		return null
	}
	
	override function getResource(resource : String) : java.net.URL {
		return null
	}
	
	override function getType(fqn : String) : IType {
		var lastDot = fqn.lastIndexOf(".")
		if(lastDot == -1) {
			return null;
		}
		var namespace = fqn.substring(0, lastDot)
		var relativeName = fqn.substring(lastDot + 1)
		if(relativeName == "Transaction") {
			return _transactionTypes.get(namespace)
		}
		var type = _types.get(fqn)
		if(type == null || (type as ITypeRef)._shouldReload()) {
			using(TypeSystem) {
				type = _types.get(fqn)
				if(type == null || (type as ITypeRef)._shouldReload()) {
					var connInfo = getConnInfo(namespace)
					if(connInfo != null and connInfo.AllTypeNames.contains(fqn)) {
						type = TypeSystem.getOrCreateTypeReference(new DBType(relativeName, this, connInfo))
						_types.put(fqn, type)
					}
				}
			}
		}
		return type
	}
	
	override function refresh(clearCaches : boolean) {
	
	}
	
	override function getIntrinsicTypeFromObject(object : Object) : IType {
		if(_accessImpls.get()) {
			return null
		}
		using(AccessImpls) {
			if(object typeis CachedDBObject) {
				return getType("${object.Connection.Namespace}.${object.TableName}")
			} else {
				return null
			}
		}
	}
  
	override function getResourceFile(name : String) : File {
	   return TypeSystem.getResourceFileResolver().resolveToFile( name )
	}
			
}