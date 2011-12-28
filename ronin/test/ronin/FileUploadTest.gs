package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

class FileUploadTest {

  @Test
  function testBytesParam() {
    var resp = RoninTest.postWithFiles("/FileParams/bytesParam", {}, {"b" -> "file contents".Bytes})
    Assert.assertEquals("file contents", resp.WriterBuffer.toString())
  }

  @Test
  function testInputStreamParam() {
    var resp = RoninTest.postWithFiles("/FileParams/inputStreamParam", {}, {"i" -> "file contents".Bytes})
    Assert.assertEquals("file contents", resp.WriterBuffer.toString())
  }

}