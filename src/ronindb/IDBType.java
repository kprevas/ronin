package ronindb;

import gw.lang.reflect.IEnhanceableType;

public interface IDBType extends IEnhanceableType {

  public DBConnection getConnection();
  
}
