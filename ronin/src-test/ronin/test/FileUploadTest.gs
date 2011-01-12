package ronin.test

uses java.lang.*

uses org.junit.Assert
uses org.junit.Test
uses org.junit.Before
uses org.junit.After

uses ronin.*

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