package ronindb;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public class JoinResult implements List<CachedDBObject> {
  
  private List<CachedDBObject> _result;
  
  private DBConnection _conn;
  private String _joinTableName;
  private String _srcTableName;
  private String _targetTableName;
  private String _id;
  
  public JoinResult(List<CachedDBObject> result, DBConnection conn, String joinTableName,
      String srcTableName, String targetTableName, String id) {
    _result = result;
    _conn = conn;
    _joinTableName = joinTableName;
    _srcTableName = srcTableName;
    _targetTableName = targetTableName;
    _id = id;
  }
  
  @Override
  public boolean add(CachedDBObject obj) {
    try {
      Connection conn = _conn.connect();
      try {
        Statement stmt = conn.createStatement();
        try {
          stmt.executeUpdate("insert into \"" + _joinTableName + "\" (\"" + _srcTableName + "_id\", \"" + _targetTableName + "_id\") values (" + _id + ", " + obj.getColumns().get("id") + ")");
        } finally {
          stmt.close();
        }
      } finally {
        conn.close();
      }
    } catch (SQLException e) {
      throw new RuntimeException(e);
    }
    return true;
  }

  @Override
  public boolean addAll(Collection<? extends CachedDBObject> objs) {
    StringBuilder query = new StringBuilder("insert into \"");
    query.append(_joinTableName).append("\" (\"").append(_srcTableName).append("_id\", \"").append(_targetTableName).append("_id\") values ");
    for(CachedDBObject obj : objs) {
      query.append("(").append(_id).append(", ").append(obj.getColumns().get("id")).append(")");
      query.append(", ");
    }
    if(!objs.isEmpty()) {
      query.setLength(query.length() - 2);
    }
    try {
      Connection conn = _conn.connect();
      try {
        Statement stmt = conn.createStatement();
        try {
          stmt.executeUpdate(query.toString());
        } finally {
          stmt.close();
        }
      } finally {
        conn.close();
      }
    } catch (SQLException e) {
      throw new RuntimeException(e);
    }
    return true;
  }

  @Override
  public boolean remove(Object o) {
    if(o instanceof CachedDBObject) {
      CachedDBObject obj = (CachedDBObject) o;
      try {
        Connection conn = _conn.connect();
        try {
          Statement stmt = conn.createStatement();
          try {
            if(_conn.joinTableHasId(_joinTableName)) {
              ResultSet results = stmt.executeQuery("select * from \"" + _joinTableName + "\" where \"" + _srcTableName + "_id\" = " + _id + " and \"" + _targetTableName + "_id\" = " + obj.getColumns().get("id") + " limit 1");
              try {
                if(results.first()) {
                  Object id = results.getObject("id");
                  stmt.executeUpdate("delete from \"" + _joinTableName + "\" where \"id\" = '" + id.toString().replace("'", "''") + "''");
                  return true;
                }
              } finally {
                results.close();
              }
            } else {
              stmt.executeUpdate("delete from \"" + _joinTableName + "\" where \"" + _srcTableName + "_id\" = " + _id + " and \"" + _targetTableName + "_id\" = " + obj.getColumns().get("id"));
            }
          } finally {
            stmt.close();
          }
        } finally {
          conn.close();
        }
      } catch (SQLException e) {
        throw new RuntimeException(e);
      }
    }
    return false;
  }

  @Override
  public void clear() {
    try {
      Connection conn = _conn.connect();
      try {
        Statement stmt = conn.createStatement();
        try {
          stmt.executeUpdate("delete from \"" + _joinTableName + "\" where \"" + _srcTableName + "_id\" = " + _id);
        } finally {
          stmt.close();
        }
      } finally {
        conn.close();
      }
    } catch (SQLException e) {
      throw new RuntimeException(e);
    }
  }



  @Override
  public int size() {
    return _result.size();
  }

  @Override
  public boolean isEmpty() {
    return _result.isEmpty();
  }

  @Override
  public boolean contains(Object o) {
    return _result.contains(o);
  }

  @Override
  public Iterator<CachedDBObject> iterator() {
    return _result.iterator();
  }

  @Override
  public Object[] toArray() {
    return _result.toArray();
  }

  @Override
  public <T> T[] toArray(T[] a) {
    return _result.toArray(a);
  }

  @Override
  public boolean containsAll(Collection<?> c) {
    return _result.containsAll(c);
  }

  @Override
  public boolean addAll(int index, Collection<? extends CachedDBObject> c) {
    return _result.addAll(index, c);
  }

  @Override
  public boolean removeAll(Collection<?> c) {
    return _result.removeAll(c);
  }

  @Override
  public boolean retainAll(Collection<?> c) {
    return _result.retainAll(c);
  }

  @Override
  public boolean equals(Object o) {
    return _result.equals(o);
  }

  @Override
  public int hashCode() {
    return _result.hashCode();
  }

  @Override
  public CachedDBObject get(int index) {
    return _result.get(index);
  }

  @Override
  public CachedDBObject set(int index, CachedDBObject element) {
    return _result.set(index, element);
  }

  @Override
  public void add(int index, CachedDBObject element) {
    _result.add(index, element);
  }

  @Override
  public CachedDBObject remove(int index) {
    return _result.remove(index);
  }

  @Override
  public int indexOf(Object o) {
    return _result.indexOf(o);
  }

  @Override
  public int lastIndexOf(Object o) {
    return _result.lastIndexOf(o);
  }

  @Override
  public ListIterator<CachedDBObject> listIterator() {
    return _result.listIterator();
  }

  @Override
  public ListIterator<CachedDBObject> listIterator(int index) {
    return _result.listIterator(index);
  }

  @Override
  public List<CachedDBObject> subList(int fromIndex, int toIndex) {
    return _result.subList(fromIndex, toIndex);
  }
  
  
}
