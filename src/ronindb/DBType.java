package ronindb;

import java.util.Collections;
import java.util.List;

import gw.lang.reflect.IType;
import gw.lang.reflect.ITypeInfo;
import gw.lang.reflect.ITypeLoader;
import gw.lang.reflect.TypeBase;
import gw.util.concurrent.LazyVar;

class DBType extends TypeBase implements IDBType {

  private String _tableName;
  private DBTypeLoader _typeLoader;
  private LazyVar<DBTypeInfo> _typeInfo;
  private DBConnection _conn;
  
  public DBType(String relativeName, DBTypeLoader dbTypeLoader,
      DBConnection connInfo) {
    _tableName = relativeName;
    _typeLoader = dbTypeLoader;
    _conn = connInfo;
    _typeInfo = new LazyVar<DBTypeInfo>() {
      @Override
      protected DBTypeInfo init() {
        return new DBTypeInfo(DBType.this);
      }
    };
  }
  
  @Override
  public DBConnection getConnection() {
    return _conn;
  }
  
  @Override
  public String getName() {
    return _conn.getNamespace() + "." + _tableName;
  }

  @Override
  public String getRelativeName() {
    return _tableName;
  }

  @Override
  public String getNamespace() {
    return _conn.getNamespace();
  }

  @Override
  public ITypeLoader getTypeLoader() {
    return _typeLoader;
  }

  @Override
  public IType getSupertype() {
    return null;
  }

  @Override
  public List<? extends IType> getInterfaces() {
    return Collections.emptyList();
  }

  @Override
  public ITypeInfo getTypeInfo() {
    return _typeInfo.get();
  }

}
