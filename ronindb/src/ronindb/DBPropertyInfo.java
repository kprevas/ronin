package ronindb;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import gw.lang.reflect.IAnnotationInfo;
import gw.lang.reflect.IPropertyAccessor;
import gw.lang.reflect.IType;
import gw.lang.reflect.ITypeInfo;
import gw.lang.reflect.PropertyInfoBase;
import gw.lang.reflect.java.IJavaType;

class DBPropertyInfo extends PropertyInfoBase {

  private String _name;
  private IType _type;
  private boolean _fk;
  private boolean _named;
  
  public DBPropertyInfo(ITypeInfo container, String propName, int type) {
    super(container);
    if(propName.endsWith("_id")) {
      String typeName;
      if(propName.substring(0, propName.length() - 3).contains("_")) {
        int underscorePos = propName.lastIndexOf('_', propName.length() - 4);
        _name = propName.substring(0, underscorePos);
        typeName = propName.substring(underscorePos + 1, propName.length() - 3);
        _named = true;
      } else {
        _name = propName.substring(0, propName.length() - 3);
        typeName = _name;
      }
      String namespace = ((IDBType)container.getOwnersType()).getConnection().getNamespace();
      _type = container.getOwnersType().getTypeLoader().getType(namespace + "." + typeName);
      _fk = true;
    } else {
      _name = propName;
      _type = Util.getJavaType(type);
    }
  }
  
  @Override
  public String getName() {
    return _name;
  }

  @Override
  public boolean isReadable() {
    return true;
  }

  @Override
  public boolean isWritable(IType whosAskin) {
    return !_name.equals("id");
  }

  @Override
  public IPropertyAccessor getAccessor() {
    return new IPropertyAccessor() {
      @Override
      public void setValue(Object ctx, Object value) {
        if(_fk) {
          ((CachedDBObject)ctx).getColumns().put(getColumnName(), ((CachedDBObject)value).getColumns().get("id"));
        } else {
          ((CachedDBObject)ctx).getColumns().put(getColumnName(), value);
        }
      }
      @Override
      public Object getValue(Object ctx) {
        if(_fk) {
          try {
            return ((DBTypeInfo)_type.getTypeInfo()).selectById(((CachedDBObject)ctx).getColumns().get(getColumnName()));
          } catch (SQLException e) {
            throw new RuntimeException(e);
          }
        } else {
          return ((CachedDBObject)ctx).getColumns().get(getColumnName());
        }
      }
    };
  }

  @Override
  public Map<IType, List<IAnnotationInfo>> getDeclaredAnnotations() {
    return Collections.emptyMap();
  }

  @Override
  public boolean hasAnnotation(IType type) {
    return false;
  }

  @Override
  public IType getFeatureType() {
    return _type;
  }

  public String getColumnName() {
    if(_fk) {
      if(_named) {
        return getName() + "_" + _type.getRelativeName() + "_id";
      } else {
        return getName() + "_id";
      }
    } else {
      return getName();
    }
  }

}
