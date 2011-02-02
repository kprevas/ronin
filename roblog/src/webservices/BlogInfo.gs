package webservices

@gw.xml.ws.annotation.WsiWebService
class BlogInfo {
  function getIt() : String {
    return "This... is... ROBLOG!!!!"
  }
}