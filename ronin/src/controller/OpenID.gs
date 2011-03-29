package controller

uses ronin.*

uses gw.util.*
uses gw.xml.simple.SimpleXmlNode

uses org.apache.http.client.methods.*
uses org.apache.http.impl.client.*

@NoAuth
class OpenID extends RoninController {

  function login(providerURL : String, redirectTo : String) {
    if(AuthManager == null) {
      throw "Auth manager must be configured in order to use OpenID authentication."
    }
    Session["__ronin_openid_provider"] = providerURL
    Session["__ronin_openid_referrer"] = redirectTo ?: Referrer
    var oidResponse = new DefaultHttpClient().execute(new HttpGet(providerURL))
    var oidResponseText = ""
    try {
      oidResponseText = StreamUtil.getContent(StreamUtil.getInputStreamReader(oidResponse.Entity.Content))
      var oidXml = SimpleXmlNode.parse(oidResponseText)
      var oidURL = oidXml.Children.firstWhere(\n -> n.Name == "XRD")
        .Children.firstWhere(\n -> n.Name == "Service")
        .Children.firstWhere(\n -> n.Name == "URI").Text
      Session["__ronin_openid_provider_resolved"] = oidURL
      Response.sendRedirect(oidURL +
        "?openid.ns=http://specs.openid.net/auth/2.0" +
        "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select" +
        "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select" +
        "&openid.return_to=${RoninTemplate.postUrlFor(#complete())}" +
        "&openid.realm=${Request.RootURL}" +
        "&openid.mode=checkid_setup" +
        "&openid.ns.ax=http://openid.net/srv/ax/1.0" +
        "&openid.ax.mode=fetch_request" +
        "&openid.ax.type.email=http://axschema.org/contact/email" +
        "&openid.ax.required=email"
      )
    } catch(e) {
      e.printStackTrace()
      throw "Invalid response from OpenID provider: ${oidResponseText}"
    }
  }

  function complete() {
    if(Request.getParameter("openid.mode") == "id_res") {
      if(Request.getParameter("openid.op_endpoint") == Session["__ronin_openid_provider_resolved"] as String) {
        for(param in Request.ParameterMap.entrySet())
          if(param.Key.startsWith("openid.ns.") and param.Value[0] == "http://openid.net/srv/ax/1.0") {
            var email = Request.getParameter("openid.${param.Key.substring("openid.ns.".length)}.value.email")
            AuthManager.openidLogin(email, Session["__ronin_openid_provider"] as String)
            break
          }
      }
    }
    var redirectURL = Session["__ronin_openid_referrer"] as String
    postLoginRedirect(redirectURL)
  }

}