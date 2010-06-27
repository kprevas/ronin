package ronindb;

public class Join {

  private String _propName;
  private String _joinTable;
  private String _targetTable;
  
  public Join(String propName, String targetTable, String joinTable) {
    _propName = propName;
    _joinTable = joinTable;
    _targetTable = targetTable;
  }

  public String getPropName() {
    return _propName;
  }

  public String getJoinTable() {
    return _joinTable;
  }

  public String getTargetTable() {
    return _targetTable;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result
        + ((_joinTable == null) ? 0 : _joinTable.hashCode());
    result = prime * result + ((_propName == null) ? 0 : _propName.hashCode());
    result = prime * result
        + ((_targetTable == null) ? 0 : _targetTable.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    Join other = (Join) obj;
    if (_joinTable == null) {
      if (other._joinTable != null)
        return false;
    } else if (!_joinTable.equals(other._joinTable))
      return false;
    if (_propName == null) {
      if (other._propName != null)
        return false;
    } else if (!_propName.equals(other._propName))
      return false;
    if (_targetTable == null) {
      if (other._targetTable != null)
        return false;
    } else if (!_targetTable.equals(other._targetTable))
      return false;
    return true;
  }

}
