package ronin.js

uses javax.servlet.*
uses javax.servlet.http.*
uses gw.lang.reflect.gs.IGosuClass
uses java.util.ArrayList
uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.gs.GosuClassTypeLoader
uses ronin.RoninController
uses java.net.URL
uses gw.util.concurrent.LockingLazyVar.LazyVarInit
uses gw.util.concurrent.LockingLazyVar

class RoninJS implements Filter {

  var jqueryURL : String as JQueryURL = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
  var blockUiURL : String as BlockUIURL = "http://malsup.github.com/jquery.blockUI.js"

  var jqueryContent = new LockingLazyVar<String>() {
    override function init(): java.lang.String {
      return jqueryURL == null ? null : new URL(jqueryURL).get()
    }
  }

  var blockUiContent = new LockingLazyVar<String>() {
    override function init(): java.lang.String {
      return blockUiURL == null ? null : new URL(blockUiURL).get()
    }
  }

  override function init(cfg : FilterConfig) {}

  override function doFilter(req: ServletRequest, resp: ServletResponse, chain: FilterChain) {
    var httpReq = req as HttpServletRequest
    if(httpReq.PathInfo.endsWith("/js/ronin.js")) {
      outputJs(req, resp)
    } else {
      chain.doFilter(req, resp);
    }
  }
  
  function outputJs(req: ServletRequest, r : ServletResponse) {
    var jquery = jqueryContent.get()
    if(jquery != null) {
      write(r, jquery)
    }
    var blockUI = blockUiContent.get()
    if(blockUI != null) {
//      write(r, blockUI)
    }
    Header.render(r.Writer)
    for( clazz in findControllerClasses()) {
      ClassCode.render(r.Writer, req, clazz)
    }
    Footer.render(r.Writer)
  }
  
  function write(resp : ServletResponse, out : String) {
    resp.Writer.append(out)
  }
  
  function findControllerClasses() : List<IGosuClass> {
    var lst = new ArrayList<IGosuClass>()
    var gstl = TypeSystem.getTypeLoader(GosuClassTypeLoader)
    for( name in gstl.AllTypeNames ) {
      if( name.toString().startsWith("controller.")) {
        var clazz = TypeSystem.getByFullName(name.toString()) as IGosuClass
        if(RoninController.Type.isAssignableFrom(clazz)) {
          lst.add(clazz)
        }
      }
    }
    return lst
  }
  

  override function destroy() {}
}