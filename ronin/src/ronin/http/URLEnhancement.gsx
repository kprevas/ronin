package ronin.http

uses java.net.URL
uses java.util.Map

uses org.apache.http.message.*
uses org.apache.http.client.entity.*
uses org.apache.http.client.utils.*
uses org.apache.http.client.methods.*
uses org.apache.http.impl.client.*
uses org.apache.http.client.*
uses org.apache.http.util.*
uses org.apache.http.*

enhancement URLEnhancement : URL {

  function get( params : Map<String, Object> = null, httpClient : HttpClient = null ) : String {
    var resp = getRaw(params, httpClient)
    return EntityUtils.toString( resp.Entity )
  }

  function getRaw( params : Map<String, Object> = null, httpClient : HttpClient = null ) : HttpResponse {
    var url = this
    var paramList = params?.entrySet()?.map( \ m -> new BasicNameValuePair(m.Key, m.Value == null ? "" : m.Value.toString() ) )
    if(paramList == null) paramList = {}
    var uri = URIUtils.createURI( url.Protocol, url.Host, url.Port, url.Path, URLEncodedUtils.format( paramList, "UTF-8" ), null )
    var getObj = new HttpGet(uri)
    httpClient = httpClient == null ?  new DefaultHttpClient() : httpClient
    return httpClient.execute( getObj )
  }

  function post( form : Map<String, Object> = null, httpClient : HttpClient = null ) : String {
    var resp = postRaw(form, httpClient)
    return EntityUtils.toString( resp.Entity )
  }

  function postRaw( form : Map<String, Object> = null, httpClient : HttpClient = null ) : HttpResponse {
    var url = this
    var paramList = form?.entrySet()?.map( \ m -> new BasicNameValuePair(m.Key, m.Value == null ? "" : m.Value.toString() ) )
    if(paramList == null) paramList = {}
    var uri = URIUtils.createURI( url.Protocol, url.Host, url.Port, url.Path, "", null )
    var postObject = new HttpPost(uri)
    postObject.setEntity( new UrlEncodedFormEntity(paramList, "UTF-8" ) )
    httpClient = httpClient == null ?  new DefaultHttpClient() : httpClient
    return httpClient.execute( postObject )
  }
}