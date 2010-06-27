package ronindb;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;


class CachedDBObject {

  private Map<String, Object> _columns;
  private String _tableName;
  private DBTypeLoader _typeLoader;
  private DBConnection _conn;
  private boolean _new;
  
  public String getTableName() {
    return _tableName;
  }

  public DBConnection getConnection() {
    return _conn;
  }
  
  public boolean isNew() {
    return _new;
  }
  
  public Map<String, Object> getColumns() {
    return _columns;
  }
  
  public CachedDBObject(String tableName, DBTypeLoader typeLoader, DBConnection conn, boolean isNew) {
    _columns = new HashMap<String, Object>();
    _tableName = tableName;
    _typeLoader = typeLoader;
    _conn = conn;
    _new = isNew;
  }
  
  public void update() throws SQLException {
    Connection conn = _conn.connect();
    try {
      Statement stmt = conn.createStatement();
      try {
        if(_new) {
          List<String> keys = new ArrayList<String>();
          List<String> values = new ArrayList<String>();
          for(Entry<String, Object> entry : _columns.entrySet()) {
            keys.add(entry.getKey());
            values.add(entry.getValue() == null ? "null" : "'" + entry.getValue().toString().replace("'", "''") + "'");
          }
          StringBuilder query = new StringBuilder("insert into \"");
          query.append(_tableName).append("\" (");
          for(String key : keys) {
            query.append("\"").append(key).append("\"");
            if(key != keys.get(keys.size() - 1)) {
              query.append(", ");
            }
          }
          query.append(") values (");
          for(String value : values) {
            query.append(value);
            if(value != values.get(values.size() - 1)) {
              query.append(", ");
            }
          }
          query.append(")");
          stmt.executeUpdate(query.toString(), Statement.RETURN_GENERATED_KEYS);
          ResultSet result = stmt.getGeneratedKeys();
          try {
            if(result.first()) {
              _columns.put("id", result.getObject(1));
              _new = false;
            }
          } finally {
            result.close();
          }
        } else {
          List<String> attrs = new ArrayList<String>();
          for(Entry<String, Object> entry : _columns.entrySet()) {
            attrs.add("\"" + entry.getKey() + "\" = " + (entry.getValue() == null ? "null" : "'" + entry.getValue().toString().replace("'", "''") + "'"));
          }
          StringBuilder query = new StringBuilder("update \"");
          query.append(_tableName).append("\" set ");
          for(String attr : attrs) {
            query.append(attr);
            if(attr != attrs.get(attrs.size() - 1)) {
              query.append(", ");
            }
          }
          query.append(" where \"id\" = '");
          query.append(_columns.get("id").toString().replace("'", "''"));
          query.append("'");
          stmt.executeUpdate(query.toString());
        }
      } finally {
        stmt.close();
      }
    } finally {
      conn.close();
    }
  }
  
  public void delete() throws SQLException {
    Connection conn = _conn.connect();
    try {
      Statement stmt = conn.createStatement();
      try {
        stmt.execute("delete from \"" + _tableName + "\" where \"id\" = '" + _columns.get("id").toString().replace("'", "''") + "'");
      } finally {
        stmt.close();
      }
    } finally {
      conn.close();
    }
  }

  @Override
  public String toString() {
    return _columns.toString();
  }

  @Override
  public int hashCode() {
    int hashCode = _tableName.hashCode();
    List<String> keys = new ArrayList<String>(_columns.keySet());
    Collections.sort(keys);
    for(String columnName : keys) {
      if(_columns.get(columnName) != null) {
        hashCode = hashCode * 17 + _columns.get(columnName).hashCode();
      } else {
        hashCode *= 17;
      }
    }
    return hashCode;
  }

  @Override
  public boolean equals(Object obj) {
    if(obj instanceof CachedDBObject) {
      CachedDBObject other = (CachedDBObject) obj;
      if(_tableName.equals(other._tableName)) {
        for(String columnName : _columns.keySet()) {
          if(_columns.get(columnName) != null) {
            if(!_columns.get(columnName).equals(other._columns.get(columnName))) {
              return false;
            }
          }
        }
        for(String columnName : other._columns.keySet()) {
          if(other._columns.get(columnName) != null) {
            if(!other._columns.get(columnName).equals(_columns.get(columnName))) {
              return false;
            }
          }
        }
        return true;
      }
    }
    return false;
  }
  
  

}
