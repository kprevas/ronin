package controller

uses ronin.*

uses java.lang.*
uses java.util.*
uses java.net.*
uses gw.util.*
uses gw.xml.simple.SimpleXmlNode

uses java.math.BigInteger
uses javax.crypto.Mac
uses javax.crypto.spec.*
uses javax.crypto.interfaces.*
uses java.security.*
uses org.apache.commons.codec.binary.Base64

uses org.apache.http.*
uses org.apache.http.message.*
uses org.apache.http.client.methods.*
uses org.apache.http.client.entity.*
uses org.apache.http.impl.client.*

@NoAuth
class OpenID extends RoninController {

  public static final var GOOGLE : String = "https://www.google.com/accounts/o8/id"
  public static final var YAHOO : String = "https://open.login.yahooapis.com/openid20/www.yahoo.com/xrds"
  public static final var AOL : String = "https://api.screenname.aol.com/auth/openid/xrds"
  public static final var MY_OPENID : String = "https://www.myopenid.com/xrds"
  public static final var LAUNCHPAD : String = "https://login.launchpad.net/+xrds"
  public static final var LIVEJOURNAL : String = "http://{username}.livejournal.com/data/yadis"
  public static final var STEAM : String = "https://steamcommunity.com/openid"
  public static final var VERISIGN : String = "https://pip.verisignlabs.com/user/{username}/yadisxrds"

  // TODO support immediate mode

  /**
   *  Redirects the user to an OpenID endpoint.
   *  @param providerURL The OpenID discovery URL.
   *  @param redirectTo The default URL to redirect the user to after they've logged in.  (If the user
   *  was automatically redirected to the login screen by trying to access an authentication-required URL,
   *  they will be redirected to that URL instead.)
   *  @param immediate (Optional) If true, immediate mode is used.
   *  @param username (Optional) If the discovery URL contains the string "{username}", it will be replaced
   *  with this.  Default is the empty string.
   */
  function login(providerURL : String, redirectTo : String, immediate : boolean = false, username : String = "") {
    if(AuthManager == null) {
      throw "Auth manager must be configured in order to use OpenID authentication."
    }
    providerURL = providerURL.replaceAll("\\{username\\}", username)
    Session["__ronin_openid_provider"] = providerURL
    Session["__ronin_openid_referrer"] = redirectTo ?: Referrer
    var nonce = UUID.randomUUID().toString()
    Session["__ronin_openid_nonce"] = nonce
    Ronin.log("Requesting OpenID endpoint from ${providerURL}", TRACE, "OpenID")
    var discoveryRequest = new HttpGet(providerURL)
    discoveryRequest.setHeader("Accept", "application/xrds+xml")
    var oidResponse = new DefaultHttpClient().execute(discoveryRequest)
    var oidResponseText = ""
    try {
      oidResponseText = StreamUtil.getContent(StreamUtil.getInputStreamReader(oidResponse.Entity.Content))
      Ronin.log("OpenID endpoint response was ${oidResponseText}", TRACE, "OpenID")
      var oidXml = SimpleXmlNode.parse(oidResponseText)
      var oidURL = oidXml.Children.firstWhere(\n -> n.Name == "XRD")
        .Children.firstWhere(\n -> n.Name == "Service" and
          n.Children.hasMatch(\c -> c.Name == "Type" and c.Text.startsWith("http://specs.openid.net/auth/2.0/")))
        .Children.firstWhere(\n -> n.Name == "URI").Text
      Session["__ronin_openid_provider_resolved"] = oidURL
      var assocHandle = getAssocHandle(oidURL)
      var oidRequest = oidURL + (oidURL.contains("?") ? "&" : "?") +
        "openid.ns=http://specs.openid.net/auth/2.0" +
        "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select" +
        "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select" +
        "&openid.return_to=${URLEncoder.encode(urlFor(#complete(nonce)), "UTF-8")}" +
        "&openid.realm=${Request.RootURL}" +
        "&openid.mode=checkid_${immediate ? "immediate" : "setup"}" +
        "&openid.assoc_handle=${assocHandle.Handle}" +
        "&openid.ns.ax=http://openid.net/srv/ax/1.0" +
        "&openid.ax.mode=fetch_request" +
        "&openid.ax.type.email=http://axschema.org/contact/email" +
        "&openid.ax.required=email"
      Ronin.log("Sending OpenID redirect to ${oidRequest}", TRACE, "OpenID")
      Response.sendRedirect(oidRequest)
    } catch(e) {
      Ronin.log("Invalid response received from OpenID provider: ${oidResponseText}", ERROR, "OpenID", e)
      Response.sendRedirect(redirectTo)
    }
  }

  /**
   *  The user is redirected here by the OpenID provider.  You shouldn't be using this method directly.
   */
  function complete(nonce : String) {
    try {
      if(slowEquals(nonce, Session["__ronin_openid_nonce"] as String)) {
        if(Request.getParameter("openid.mode") == "id_res") {
          var provider = Request.getParameter("openid.op_endpoint")
          if(provider == Session["__ronin_openid_provider_resolved"] as String) {
            var assocHandle = getAssocHandle(provider)
            if(assocHandle.Handle == null or assocHandle.Handle == Request.getParameter("openid.assoc_handle")) {
              if(checkRequestSignature(assocHandle.Key)) {
                var email : String = null
                var identity : String = null
                for(param in Request.ParameterMap.entrySet()) {
                  var key = param.Key as String
                  var value = param.Value as String
                  if(key == "openid.identity") {
                    identity = value
                  }
                  if(key.startsWith("openid.ns.") and value == "http://openid.net/srv/ax/1.0") {
                    email = Request.getParameter("openid.${key.substring("openid.ns.".length)}.value.email")
                  }
                  if(identity != null and email != null) {
                    break
                  }
                }
                if(identity != null or email != null) {
                  Ronin.log("OpenID response received for ${identity} (${email})", TRACE, "OpenID")
                  AuthManager.openidLogin(identity, email, Session["__ronin_openid_provider"] as String)
                } else {
                  Ronin.log("No identity or e-mail address in OpenID response", WARN, "OpenID")
                }
              } else {
                Ronin.log("OpenID response signature was incorrect", WARN, "OpenID")
              }
            } else {
              Ronin.log("OpenID association handle did not match", WARN, "OpenID")
            }
          } else {
            Ronin.log("Received OpenID response from incorrect endpoint ${provider}", WARN, "OpenID")
          }
        } else {
          Ronin.log("OpenID response mode was ${Request.getParameter("openid.mode")}", TRACE, "OpenID")
        }
      } else {
        Ronin.log("OpenID nonce did not match", WARN, "OpenID")
      }
      var redirectURL = Session["__ronin_openid_referrer"] as String
      postLoginRedirect(redirectURL)
    } finally {
      Session["__ronin_openid_nonce"] = null
      Session["__ronin_openid_provider"] = null
      Session["__ronin_openid_referrer"] = null
      Session["__ronin_openid_provider_resolved"] = null
    }
  }

  /**
   *  Returns the XRDS document required for relying party discovery.
   */
  function xrds() : String {
    Response.ContentType = "application/xrds+xml"
    return "<Service xmlns=\"xri://$xrd*($v*2.0)\">" +
      "<Type>http://specs.openid.net/auth/2.0/return_to</Type>" +
      "<URI>${postUrlFor(#complete(String))}</URI>" +
      "</Service>"
  }

  private function getAssocHandle(provider : String) : AssocHandle {
    var assocHandle = Ronin.cache(\ -> fetchAssocHandle(provider), "__ronin_openid_${provider}", APPLICATION)
    if(System.currentTimeMillis() > assocHandle.expires) {
      assocHandle = fetchAssocHandle(provider)
      Ronin.invalidate("__ronin_openid_${provider}", APPLICATION)
      assocHandle = Ronin.cache(\ -> assocHandle, "__ronin_openid_${provider}", APPLICATION)
    }
    return assocHandle
  }

  private function fetchAssocHandle(provider : String) : AssocHandle {
    var useDH = provider.startsWith("http://")
    var assocRequest = provider +
      "?openid.ns=http://specs.openid.net/auth/2.0" +
      "&openid.mode=associate" +
      "&openid.assoc_type=HMAC-SHA1" +
      "&openid.session_type=${useDH ? "DH-SHA1" : "no-encryption"}"
    var privateKey : DHPrivateKey = null
    var p = new BigInteger("155172898181473697471232257763715539915724801966915404479707795314057629378541917580651227423698188993727816152646631438561595825688188889951272158842675419950341258706556549803580104870537681476726513255747040765857479291291572334510643245094715007229621094194349783925984760375594985848253359305585439638443")
    var g = new BigInteger("2")
    if(useDH) {
      var paramSpec = new DHParameterSpec(p, g)
      var keyPairGen = KeyPairGenerator.getInstance("DH")
      keyPairGen.initialize(paramSpec)
      var keyPair = keyPairGen.generateKeyPair()
      privateKey = keyPair.getPrivate() as DHPrivateKey
      assocRequest += "&openid.dh_consumer_public=${Base64.encodeBase64((keyPair.getPublic() as DHPublicKey).Y.toByteArray())}"
    }
    Ronin.log("Sending OpenID association request to ${assocRequest}", TRACE, "OpenID")
    var assocResponse = new DefaultHttpClient().execute(new HttpGet(assocRequest))
    var responseText = StreamUtil.getContent(StreamUtil.getInputStreamReader(assocResponse.Entity.Content))
    Ronin.log("OpenID association response was ${responseText}", TRACE, "OpenID")
    var assocHandle = new AssocHandle()
    var serverPublicKey : DHPublicKey = null
    var encodedMacKey : byte[] = null
    for(responseLine in responseText.split("\n")) {
      if(responseLine.startsWith("assoc_handle:")) {
        assocHandle.Handle = responseLine.substring("assoc_handle:".length)
      } else if(responseLine.startsWith("expires_in:")) {
        assocHandle.Expires = System.currentTimeMillis() + Long.parseLong(responseLine.substring("expires_in:".length)) * 1000
      } else if(responseLine.startsWith("mac_key:")) {
        assocHandle.Key = Base64.decodeBase64(responseLine.substring("mac_key:".length).getBytes("UTF-8"))
      } else if(responseLine.startsWith("enc_mac_key:")) {
        encodedMacKey = Base64.decodeBase64(responseLine.substring("enc_mac_key:".length).getBytes("UTF-8"))
      } else if(responseLine.startsWith("dh_server_public:")) {
        serverPublicKey = decodePublicKey(Base64.decodeBase64(responseLine.substring("dh_server_public:".length).getBytes("UTF-8")), p, g)
      }
    }
    if(serverPublicKey != null and encodedMacKey != null) {
      assocHandle.Key = decryptMacKey(serverPublicKey, privateKey, encodedMacKey, p)
    }
    return assocHandle
  }

  private function checkRequestSignature(key : byte[]) : boolean {
    if(key != null) {
      var concatFields = new StringBuilder()
      for(fieldName in Request.getParameter("openid.signed").split(",")) {
        var value = Request.getParameter("openid.${fieldName}")
        if(value != null) {
          concatFields.append("${fieldName}:${value}\n")
        }
      }
      var signingKey = new SecretKeySpec(key, "HmacSHA1")
      var mac = Mac.getInstance("HmacSHA1")
      mac.init(signingKey)
      var rawHmac = mac.doFinal(concatFields.toString().getBytes("UTF-8"))
      var signature = new String(Base64.encodeBase64(rawHmac), "UTF-8")
      return slowEquals(signature, Request.getParameter("openid.sig"))
    } else {
      var post = new HttpPost(Request.getParameter("openid.op_endpoint"))
      var nvps = new List<NameValuePair>()
      nvps.add(new BasicNameValuePair("openid.ns", "http://specs.openid.net/auth/2.0"))
      nvps.add(new BasicNameValuePair("openid.mode", "check_authentication"))
      nvps.add(new BasicNameValuePair("openid.signed", Request.getParameter("openid.signed")))
      nvps.add(new BasicNameValuePair("openid.assoc_handle", Request.getParameter("openid.assoc_handle")))
      nvps.add(new BasicNameValuePair("openid.sig", Request.getParameter("openid.sig")))
      for(param in Request.getParameter("openid.signed").split(",")) {
        nvps.add(new BasicNameValuePair("openid.${param}", Request.getParameter("openid.${param}")))
      }
      post.Entity = new UrlEncodedFormEntity(nvps, "UTF-8")
      var authResponse = new DefaultHttpClient().execute(post)
      return StreamUtil.getContent(StreamUtil.getInputStreamReader(authResponse.Entity.Content)).contains("is_valid:true")
    }
  }

  private static function slowEquals(s1 : String, s2 : String) : boolean {
    if (s1.length != s2.length) {
      return false
    }

    var result = 0
    for (i in 0..|s1.length) {
      result |= (s1.charAt(i) as int) ^ (s2.charAt(i) as int)
    }
    return result == 0
  }

  private static function decryptMacKey(serverPublicKey : DHPublicKey, privateKey : DHPrivateKey,
    encodedMacKey : byte[], p : BigInteger) : byte[] {
    var zz = serverPublicKey.Y.modPow(privateKey.X, p)
    var hzz = MessageDigest.getInstance("SHA-1").digest(zz.toByteArray())
    var macKey = new byte[hzz.length]
    for(i in 0..|hzz.length) {
      macKey[i] = (hzz[i] ^ encodedMacKey[i]) as byte
    }
    return macKey
  }

  private static function decodePublicKey(bytes : byte[], p : BigInteger, g : BigInteger) : DHPublicKey {
    var y = new BigInteger(bytes)
    var publicKeySpec = new DHPublicKeySpec(y, p, g)
    return KeyFactory.getInstance("DH").generatePublic(publicKeySpec) as DHPublicKey
  }

  private static class AssocHandle {
    var _handle : String as Handle
    var _expires : long as Expires
    var _key : byte[] as Key
  }

}