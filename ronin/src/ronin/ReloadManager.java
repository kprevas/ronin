package ronin;

import gw.lang.reflect.IType;
import gw.lang.reflect.ITypeRef;
import gw.lang.reflect.TypeSystem;
import gw.lang.reflect.gs.IGosuClass;
import gw.util.GosuClassUtil;

import java.io.File;
import java.util.HashMap;

class ReloadManager {

  private static HashMap<File,Long> TIMESTAMPS;
  private static File SOURCE_ROOT;

  public static void detectAndReloadChangedResources() {
    if (!maybeInit()) {
      scanForChanges(true);
    }
  }

  private static void scanForChanges(boolean updateResource) {
    scanForChanges(SOURCE_ROOT, updateResource);
    if (updateResource) {
      // acts on the current module's Gosu typeloader
      TypeSystem.getGosuClassLoader().reloadChangedClasses();
    }
  }

  private static void scanForChanges(File file, boolean updateResource) {
    if (file.isFile()) {
      String ext = GosuClassUtil.getFileExtension(file);
      if (".gs".equals(ext) || ".gsx".equals(ext) || ".gst".equals(ext)) {
        long modified = file.lastModified();
        if (updateResource) {
          Long lastTimeStamp = TIMESTAMPS.get(file);
          if (lastTimeStamp == null || modified != lastTimeStamp) {
            fireResourceUpdate(file);
          }
        }
        TIMESTAMPS.put(file, modified);
      }
    } else if (file.isDirectory()) {
      for (File child : file.listFiles()) {
        scanForChanges(child, updateResource);
      }
    }
  }

  private static void fireResourceUpdate(File file) {
    String filePath = file.getAbsolutePath();
    String rootPath = SOURCE_ROOT.getAbsolutePath();
    String typeName = filePath.substring(rootPath.length() + 1, filePath.lastIndexOf('.'));
    typeName = typeName.replace(File.separatorChar, '.');
    IType type = TypeSystem.getByFullNameIfValid(typeName);
    if (type != null) {
      TypeSystem.refresh((ITypeRef) type, true);
    }
  }

  private static boolean maybeInit() {
    if (SOURCE_ROOT == null) {
      return true;
    }
    if (TIMESTAMPS == null) {
      TIMESTAMPS = new HashMap<File, Long>();
      scanForChanges(false);
      return true;
    } else {
      return false;
    }
  }

  static void setSourceRoot(File f) {
    SOURCE_ROOT = f;
  }
}