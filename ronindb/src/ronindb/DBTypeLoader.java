package ronindb;

import gw.lang.reflect.IExtendedTypeLoader;
import gw.lang.reflect.IType;
import gw.lang.reflect.ITypeRef;
import gw.lang.reflect.TypeSystem;
import gw.lang.reflect.java.IJavaClassInfo;
import gw.lang.reflect.module.IExecutionEnvironment;
import gw.lang.reflect.module.IFile;
import gw.lang.reflect.module.IModule;
import gw.util.Pair;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class DBTypeLoader implements IExtendedTypeLoader {

  private IModule _module;
  private Map<String, IType> _types;
  private Map<String, TransactionType> _transactionTypes;
  private Set<String> _initializedDrivers = new HashSet<String>();
  private Map<String, DBConnection> _connInfos = new HashMap<String, DBConnection>();

  public DBTypeLoader() {
    this(TypeSystem.getExecutionEnvironment(), new HashMap<String, String>());
  }
  
  public DBTypeLoader(IExecutionEnvironment env, Map<String, String> args) {
    _module = env.getCurrentModule();
    _types = new HashMap<String, IType>();
    _transactionTypes = new HashMap<String, TransactionType>();
  }
  
  @Override
  public IModule getModule() {
    return _module;
  }
  
  private void initMysql() {
    if(!_initializedDrivers.contains("mysql")) {
      _initializedDrivers.add("mysql");
      try {
        Class.forName("com.mysql.jdbc.Driver");
      } catch (ClassNotFoundException e) {
        // ignore
      }
    }
  }
  
  private void initH2() {
    if(!_initializedDrivers.contains("h2")) {
      _initializedDrivers.add("h2");
      try {
        Class.forName("org.h2.Driver");
      } catch (ClassNotFoundException e) {
        // ignore
      }
    }
  }
  
  private Set<String> getAllFullNamespaces() {
    Set<String> allFullNamespaces = new HashSet<String>();
    for(Pair<String, IFile> dbcFile : _module.getResourceAccess().findAllFilesByExtension(".dbc")) {
      String fileName = dbcFile.getFirst();
      allFullNamespaces.add(fileName.substring(0, fileName.length() - ".dbc".length()).replace(File.separator, "."));
    }
    return allFullNamespaces;
  }
  
  private DBConnection getConnInfo(String namespace) throws IOException {
    DBConnection connInfo = _connInfos.get(namespace);
    if(connInfo == null && getAllFullNamespaces().contains(namespace)) {
      URL connRsrc = _module.getResource(namespace.replace('.', '/') + ".dbc");
      InputStream connRsrcStream = connRsrc.openStream();
      StringBuilder connUrlBuilder = new StringBuilder();
      String line;
      BufferedReader reader = new BufferedReader(new InputStreamReader(connRsrcStream));
      while((line = reader.readLine()) != null) {
        connUrlBuilder.append(line);
      }
      String connUrl = connUrlBuilder.toString();
      if(connUrl.startsWith("jdbc:mysql")) {
        initMysql();
      } else if(connUrl.startsWith("jdbc:h2")) {
        initH2();
      }
      connInfo = new DBConnection(connUrl, namespace);
      _connInfos.put(namespace, connInfo);
    }
    return connInfo;
  }

  @Override
  public IType getIntrinsicType(Class javaClass) {
    return null;
  }

  @Override
  public IType getIntrinsicType(IJavaClassInfo javaClassInfo) {
    return null;
  }

  @Override
  public IType getType(String fullyQualifiedName) {
    int lastDot = fullyQualifiedName.lastIndexOf('.');
    if(lastDot == -1) {
      return null;
    }
    String namespace = fullyQualifiedName.substring(0, lastDot);
    String relativeName = fullyQualifiedName.substring(lastDot + 1);
    if("Transaction".equals(relativeName)) {
      TransactionType type = _transactionTypes.get(namespace);
      if(type == null) {
        try {
          type = new TransactionType(getConnInfo(namespace), this);
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
        _transactionTypes.put(namespace, type);
      }
      return type;
    }
    IType type = _types.get(fullyQualifiedName);
    if(type == null || ((ITypeRef)type)._shouldReload()) {
      TypeSystem.lock();
      try {
        type = _types.get(fullyQualifiedName);
        if(type == null || ((ITypeRef)type)._shouldReload()) {
          DBConnection connInfo;
          try {
            connInfo = getConnInfo(namespace);
          } catch (IOException e) {
            throw new RuntimeException(e);
          }
          if(connInfo != null && connInfo.getAllTypeNames().contains(fullyQualifiedName)) {
            type = TypeSystem.getOrCreateTypeReference(new DBType(relativeName, this, connInfo));
            _types.put(fullyQualifiedName, type);
          }
        }
      } finally {
        TypeSystem.unlock();
      }
    }
    return type;
  }

  @Override
  public Set<? extends CharSequence> getAllTypeNames() {
    Set<String> typeNames = new HashSet<String>();
    for(String namespace : getAllFullNamespaces()) {
      typeNames.add(namespace + ".Transaction");
      try {
        typeNames.addAll(getConnInfo(namespace).getAllTypeNames());
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    return typeNames;
  }

  @Override
  public Set<? extends CharSequence> getAllNamespaces() {
    Set<String> allNamespaces = new HashSet<String>();
    for (String namespace : getAllFullNamespaces()) {
      String[] nsComponentsArr = namespace.split("\\.");
      for(int i = 0; i < nsComponentsArr.length; i++) {
        String nsName = "";
        for(int n = 0; n < i + 1; n++) {
          if(n > 0) {
            nsName += ".";
          }
          nsName += nsComponentsArr[n];
        }
        allNamespaces.add(nsName);
      }
    }
    return allNamespaces;
  }

  @Override
  public URL getResource(String name) {
    return _module.getResource(name);
  }

  @Override
  public File getResourceFile(String name) {
    return TypeSystem.getResourceFileResolver().resolveToFile(name);
  }

  @Override
  public void refresh(boolean clearCachedTypes) {
    // TODO?
  }

  @Override
  public boolean isCaseSensitive() {
    return true;
  }

  @Override
  public List<String> getHandledPrefixes() {
    return Collections.emptyList();
  }

  @Override
  public boolean isNamespaceOfTypeHandled(String fullyQualifiedTypeName) {
    int lastDot = fullyQualifiedTypeName.lastIndexOf('.');
    if(lastDot == -1) {
      return false;
    }
    return getAllFullNamespaces().contains(fullyQualifiedTypeName.substring(0, lastDot));
  }

  @Override
  public List<Throwable> getInitializationErrors() {
    return Collections.emptyList();
  }

  @Override
  public IType getIntrinsicTypeFromObject(Object object) {
    if(object instanceof CachedDBObject) {
      CachedDBObject dbObj = (CachedDBObject) object;
      return getType(dbObj.getConnection().getNamespace() + "." + dbObj.getTableName());
    } else {
      return null;
    }
  }

}
