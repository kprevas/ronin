package controller

uses java.io.*

class FileParams extends ronin.RoninController {

  function bytesParam(b : byte[]) {
    view.OneStringArg.render(Writer, new String(b))
  }

  function inputStreamParam(i : InputStream) {
    var buf = new BufferedReader(new InputStreamReader(i))
    var s = ""
    var line = buf.readLine()
    while(line != null) {
      if(s != "") {
        s += "\n"
      }
      s += line
      line = buf.readLine()
    }
    view.OneStringArg.render(Writer, s)
  }

}