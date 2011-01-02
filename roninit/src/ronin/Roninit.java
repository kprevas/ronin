package ronin;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.security.CodeSource;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class Roninit {

  public static void main(String[] args) throws URISyntaxException, IOException {
    if(args.length < 2) {
      printUsage();
      System.exit(-1);
    }
    
    if(args[0].equals("init")) {
      File rootDir = new File(args[1]);
      if(rootDir.exists()) {
        logError(rootDir + " already exists");
        System.exit(-1);
      }
      rootDir.mkdir();
      extractRoninTo(rootDir, true);

      detectAardvark();

      print("A ronin application was created at " + rootDir.getPath() + ".  To start the application:\n\n  cd " + rootDir.getPath() + " \n  vark server");
    }
    else if(args[0].equals("update")) {
      File rootDir = new File(args[1]);
      if(!rootDir.exists()) {
        logError("No ronin application was found at " + rootDir.getAbsolutePath());
      }
      extractRoninTo(rootDir, false);
      print("The ronin application at " + rootDir.getAbsolutePath() + " was updated to the latest ronin code from " + getRoninitJar().getAbsolutePath());
    }
    else {
      printUsage();
    }
  }

  private static void detectAardvark() {
    String path = System.getenv("PATH");
    if(path != null) {
      for(String s : path.split(File.pathSeparator)) {
        if (s.charAt(0) == '~') {
          s = System.getProperty("user.home") + s.substring(1);
        }
        if (new File(s, "vark").exists()) {
          return;
        }
      }
    }
    print("Aardvark was not found on your path.  Ronin uses Aardvark to package and run applications.\n" +
           "Please download it from http://vark.github.com");
  }

  private static void extractRoninTo(File rootDir, boolean init) throws URISyntaxException, IOException {
    File sourceFile = getRoninitJar();

    if(sourceFile.getName().endsWith(".jar")) {
      JarFile jarFile = new JarFile(sourceFile);
      Enumeration<JarEntry> jarEntryEnumeration = jarFile.entries();
      while(jarEntryEnumeration.hasMoreElements()) {
        JarEntry jarEntry = jarEntryEnumeration.nextElement();
        String name = jarEntry.getName();
        if(name.startsWith("template/")) {
          String relativeName = name.substring("template/".length());
          File targetFile = new File(rootDir, relativeName);

          if(init || relativeName.startsWith("support/") || relativeName.startsWith("lib/")) {
            if(jarEntry.isDirectory()) {
              targetFile.mkdirs();
            }
            else {
              print((init ? "  Creating " : "  Updating ") + targetFile.getAbsolutePath());
              InputStream in = new BufferedInputStream(jarFile.getInputStream(jarEntry));
              OutputStream out = new BufferedOutputStream(new FileOutputStream(targetFile));
              byte[] buffer = new byte[2048];
              while(true) {
                int nBytes = in.read(buffer);
                if(nBytes <= 0) {
                  break;
                }
                out.write(buffer, 0, nBytes);
              }
              out.flush();
              out.close();
              in.close();
            }
          }
        }
      }
    }
    else {
      logError("Could not find a properly build roninit.jar file to initialize from");
    }
  }

  private static File getRoninitJar() throws URISyntaxException {
    CodeSource source = Roninit.class.getProtectionDomain().getCodeSource();
    File sourceFile = new File(source.getLocation().toURI());
    return sourceFile;
  }

  private static void print(String s) {
    System.out.println(s);
  }

  private static void logError(String s) {
    System.out.println("ERROR : " + s);
  }

  private static void printUsage() {
    System.out.println("Usage: java -jar roninit.jar [init|update] app_name");
  }

}
