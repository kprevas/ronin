package ronindb;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import gw.lang.reflect.BaseTypeInfo;
import gw.lang.reflect.IMethodCallHandler;
import gw.lang.reflect.IMethodInfo;
import gw.lang.reflect.IPropertyAccessor;
import gw.lang.reflect.IPropertyInfo;
import gw.lang.reflect.IType;
import gw.lang.reflect.MethodInfoBuilder;
import gw.lang.reflect.PropertyInfoBuilder;
import gw.lang.reflect.TypeSystem;

public class TransactionTypeInfo extends BaseTypeInfo {

  private IMethodInfo _commitMethod;
  private IPropertyInfo _lockProperty;
  private DBConnection _connInfo;
  private Lock _lock;
  
  public TransactionTypeInfo(TransactionType type) {
    super(type);
    _lock = new Lock();
    _connInfo = type.getConnection();
    _commitMethod = new MethodInfoBuilder().withName("commit").withStatic()
      .withCallHandler(new IMethodCallHandler() {
        @Override
        public Object handleCall(Object ctx, Object... args) {
          Connection conn = _connInfo.getTransaction().get();
          try {
            conn.commit();
          } catch (SQLException e) {
            e.printStackTrace();
          }
          return null;
        }
      }).build(this);
    _lockProperty = new PropertyInfoBuilder().withName("Lock").withStatic()
      .withWritable(false).withType(TypeSystem.get(Lock.class))
      .withAccessor(new IPropertyAccessor() {
        @Override
        public void setValue(Object ctx, Object value) {
        }
        @Override
        public Object getValue(Object ctx) {
          return _lock;
        }
      }).build(this);
  }

  @Override
  public List<? extends IMethodInfo> getMethods() {
    return Arrays.asList(_commitMethod);
  }

  @Override
  public IMethodInfo getMethod(CharSequence methodName, IType... params) {
    if(params == null || params.length == 0) {
      if("commit".equals(methodName)) {
        return _commitMethod;
      }
    }
    return null;
  }

  @Override
  public IMethodInfo getCallableMethod(CharSequence method, IType... params) {
    return getMethod(method, params);
  }
  
  @Override
  public List<? extends IPropertyInfo> getProperties() {
    return Collections.singletonList(_lockProperty);
  }

  @Override
  public IPropertyInfo getProperty(CharSequence propName) {
    if(propName.equals("Lock")) {
      return _lockProperty;
    }
    return null;
  }

  @Override
  public CharSequence getRealPropertyName(CharSequence propName) {
    return propName;
  }

  public class Lock {
    public void lock() {
      try {
        Connection conn = _connInfo.connect();
        conn.setAutoCommit(false);
        ConnectionWrapper wrapper = new ConnectionWrapper(conn);
        _connInfo.getTransaction().set(wrapper);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
    
    public void unlock() {
      Connection conn = _connInfo.getTransaction().get();
      try {
        conn.rollback();
        conn.close();
        _connInfo.getTransaction().set(null);
        conn.setAutoCommit(true);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
  }

}
