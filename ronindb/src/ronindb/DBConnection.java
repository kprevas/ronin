package ronindb;

import gw.lang.reflect.module.ModuleClassLoader;
import gw.util.GosuExceptionUtil;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

class DBConnection {

  private String _connectURL;
  private String _namespace;
  private ThreadLocal<Connection> _transaction;
  
  private Map<String, Set<String>> _fks = new HashMap<String, Set<String>>();
  private Map<String, Set<Join>> _joins = new HashMap<String, Set<Join>>();
  private Set<String> _joinsWithId = new HashSet<String>();
  
  private Set<String> _typeNames;

  private DBTypeLoader _typeLoader;


  public DBConnection(String connUrl, String namespace, DBTypeLoader typeLoader) {
    _connectURL = connUrl;
    _namespace = namespace;
    _transaction = new ThreadLocal<Connection>();
    _typeLoader = typeLoader;
  }
  
  public Connection connect() throws SQLException {
    Connection trans = _transaction.get();
    if(trans == null) {
      try {
        Class driverClass = Class.forName(getDriverName(_connectURL), true, _typeLoader.getModule().getClassLoader());
        Driver driver = (Driver)(driverClass.newInstance());
        return driver.connect(_connectURL, null);
      } catch (Exception e) {
        throw GosuExceptionUtil.forceThrow(e);
      }
    }
    return trans;
  }

  private static String getDriverName(String url) {
    String dbType = url.split(":")[1];
    if ("h2".equals(dbType)) {
      return "org.h2.Driver";
    }
    if ("mysql".equals(dbType)) {
      return "com.mysql.jdbc.Driver";
    }
    return System.getProperty("db.driver." + dbType);
  }

  public Set<String> getFKs(String table) {
    Set<String> fks = _fks.get(table);
    if(fks == null) {
      fks = new HashSet<String>();
      _fks.put(table, fks);
    }
    return fks;
  }
  
  public Set<Join> getJoins(String table) {
    Set<Join> joins = _joins.get(table);
    if(joins == null) {
      joins = new HashSet<Join>();
      _joins.put(table, joins);
    }
    return joins;
  }

  public Set<String> getAllTypeNames() {
    if(_typeNames == null) {
      _typeNames = new HashSet<String>();
      try {
        Connection conn = connect();
        try {
          ResultSet resultSet = conn.getMetaData().getColumns(null, null, null, null);
          try {
            if(resultSet.first()) {
              while(!resultSet.isAfterLast()) {
                String tableName = resultSet.getString("TABLE_NAME");
                if(tableName.contains("join_")) {
                  String joinName = null;
                  if(!tableName.startsWith("join_")) {
                    joinName = tableName.substring(0, tableName.indexOf('_'));
                  }
                  int lastUnderscore = tableName.lastIndexOf('_');
                  int nextToLastUnderscore = tableName.lastIndexOf('_', lastUnderscore - 1);
                  String firstTable = tableName.substring(nextToLastUnderscore + 1, lastUnderscore);
                  String secondTable = tableName.substring(lastUnderscore + 1);
                  getJoins(firstTable).add(new Join(joinName == null ? secondTable + "s" : joinName,
                      secondTable, tableName));
                  if(!firstTable.equals(secondTable)) {
                    getJoins(secondTable).add(new Join(joinName == null ? firstTable + "s" : joinName,
                        firstTable, tableName));
                  }
                  String colName = resultSet.getString("COLUMN_NAME");
                  if(colName.equals("id")) {
                    _joinsWithId.add(tableName);
                  }
                } else {
                  _typeNames.add(_namespace + "." + tableName);
                  String colName = resultSet.getString("COLUMN_NAME");
                  if(colName.endsWith("_id") && !colName.substring(0, colName.length() - 3).contains("_")) {
                    getFKs(colName.substring(0, colName.length() - 3)).add(tableName);
                  }
                }
                resultSet.next();
              }
            }
          } finally {
            resultSet.close();
          }
        } finally {
          conn.close();
        }
      } catch (SQLException e) {
        throw new RuntimeException(e);
      }
    }
    return _typeNames;
  }

  public String getNamespace() {
    return _namespace;
  }

  public ThreadLocal<Connection> getTransaction() {
    return _transaction;
  }
  
  boolean joinTableHasId(String joinTableName) {
    return _joinsWithId.contains(joinTableName);
  }

}
