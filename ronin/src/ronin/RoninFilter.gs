package ronin

uses javax.servlet.*
uses javax.servlet.http.*

class RoninFilter implements Filter {

  override function init(p0: javax.servlet.FilterConfig) {
  }

  override function doFilter(req: ServletRequest, resp: ServletResponse, chain: FilterChain) {
    if(Ronin.Config.Filters.HasElements) {
      chain = makeFilterChain(chain)
    }
    chain.doFilter(req, resp)
  }
  
  function makeFilterChain(last : FilterChain) : FilterChain {
    var reversedFilters = Ronin.Config.Filters.reverse()
    var chain = last
    for(filter in reversedFilters){
      var next = chain
      chain = \ req, resp -> filter.doFilter(req, resp, next)
    }
    return chain
  }

  override function destroy() {
  }
}