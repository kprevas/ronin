package gw.db

uses java.sql.*
uses java.util.*
uses java.lang.CharSequence
uses gw.lang.reflect.*
uses gw.lang.reflect.gs.*
uses gw.lang.parser.*

internal class TransactionTypeInfo extends BaseTypeInfo {

	var _lockMethod : IMethodInfo
	var _unlockMethod : IMethodInfo
	var _commitMethod : IMethodInfo
	
	construct(type : TransactionType) {
		super(type)
		var connInfo = type.Connection
		
		_lockMethod = new MethodInfoBuilder().withName("lock").withStatic()
			.withCallHandler(\ ctx, args -> {
				try {
					var conn = connInfo.connect()
					conn.AutoCommit = false
					var wrapper = new ConnectionWrapper(conn)
					connInfo.Transaction.set(wrapper)
				} catch (e) {
					e.printStackTrace()
				}
				return null
			}).build(this)
		_unlockMethod = new MethodInfoBuilder().withName("unlock").withStatic()
			.withCallHandler(\ ctx, args -> {
				var conn = connInfo.Transaction.get()
				conn.close()
				connInfo.Transaction.set(null)
				return null
			}).build(this)
	  _commitMethod = new MethodInfoBuilder().withName("commit").withStatic()
	    .withCallHandler(\ ctx, args -> {
				var conn = connInfo.Transaction.get()
				conn.commit()
				return null
	    }).build(this)
	}
	
	override property get Methods() : List<IMethodInfo> {
		return {_lockMethod, _unlockMethod, _commitMethod}
	}
	
	override function getMethod(methodName : CharSequence, params : IType[]) : IMethodInfo {
		if(methodName == "lock" && params.IsEmpty) {
			return _lockMethod
		} else if(methodName == "unlock" && params.IsEmpty) {
			return _unlockMethod
		} else if(methodName == "commit" && params.IsEmpty) {
		  return _commitMethod
		}
		return null
	}
	 
	override function getCallableMethod(methodName : CharSequence, params : IType[]) : IMethodInfo {
		return getMethod(methodName, params)
	}
	
}