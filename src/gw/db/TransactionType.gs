package gw.db

uses gw.lang.reflect.*

internal class TransactionType extends TypeBase implements ITransactionType {

	var _conn : DBConnection as Connection
	var _typeInfo : TransactionTypeInfo /* as TypeInfo // PL-9986 */
	property get TypeInfo() : ITypeInfo {return _typeInfo}
	var _typeLoader : DBTypeLoader /* as TypeLoader // PL-9986 */
	property get TypeLoader() : ITypeLoader {return _typeLoader}

	construct(conn : DBConnection, __typeLoader : DBTypeLoader) {
		_conn = conn
		_typeInfo = new TransactionTypeInfo(this)
		_typeLoader = __typeLoader
	}
	
	override property get Name() : String {
		return "${_conn.Namespace}.Transaction"
	}

	override property get Namespace() : String {
		return _conn.Namespace
	}
	
	override property get RelativeName() : String {
		return "Transaction"
	}

	override property get Supertype() : IType {
		return null
	}

	override property get Interfaces() : List<IType> {
		return {}
	}

  override property get Abstract() : boolean {
    return false
  }
  
  override property get Enum() : boolean {
    return false
  }

}