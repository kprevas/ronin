package ronin.test

uses java.io.*
uses java.util.*

uses javax.servlet.http.HttpServletRequest
uses org.apache.commons.fileupload.*
uses org.apache.commons.fileupload.disk.*
uses org.apache.commons.fileupload.servlet.*

internal class TestServletFileUpload extends ServletFileUpload {

  var _files : Map<String, byte[]> as Files

  construct() {
    super(new DiskFileItemFactory())
  }

  override function parseRequest(req : HttpServletRequest) : List<FileItem> {
    var fileItems : List<FileItem> = {}
    _files.eachKeyAndValue(\k, v -> {
      fileItems.add(new TestFileItem(k, v))
    })
    return fileItems
  }

  private class TestFileItem implements FileItem {

    var _name : String as FieldName
    var _bytes : byte[]

    construct(n : String, bytes : byte[]) {
      _name = n
      _bytes = bytes
    }

    override function delete() {}

    override function get() : byte[] {
      return _bytes
    }

    override property get ContentType() : String {
      return ""
    }

    override property get InputStream() : InputStream {
      return new ByteArrayInputStream(_bytes)
    }

    override property get Name() : String {
      return ""
    }

    override property get OutputStream() : OutputStream {
      return null
    }

    override property get Size() : long {
      return _bytes.length as long
    }

    override property get String() : String {
      return new String(_bytes)
    }

    override function getString(enc : String) : String {
      return new String(_bytes, enc)
    }

    override property get FormField() : boolean {
      return true
    }

    override property set FormField(f : boolean) {}

    override property get InMemory() : boolean {
      return true
    }

    override function write(f : File) {
      f.writeBytes(_bytes)
    }

  }

}