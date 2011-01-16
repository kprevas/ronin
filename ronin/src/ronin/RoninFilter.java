/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Jan 15, 2011
 * Time: 5:19:56 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Class description...
 *
 * @author kprevas
 */
/* TODO kcp - yuck.  But there's no way for the servlet to add filters once the servlet context
   has been initialized. */
public class RoninFilter implements Filter {

  private static RoninFilter INSTANCE;
  private FilterConfig _filterConfig;

  public static RoninFilter getInstance() {
    return INSTANCE;
  }

  private Filter _delegate;
  private ThreadLocal<FilterChain> _filterChain = new ThreadLocal<FilterChain>();

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    INSTANCE = this;
    _filterConfig = filterConfig;
  }

  public void delegateTo(Filter filter) throws ServletException {
    _delegate = filter;
    filter.init(_filterConfig);
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
    if(_delegate != null) {
      _delegate.doFilter(servletRequest, servletResponse, filterChain);
    } else {
      _filterChain.set(filterChain);
      try {
        filterChain.doFilter(servletRequest, servletResponse);
      } finally {
        _filterChain.remove();
      }
    }
  }

  public void reFilter(ServletRequest servletRequest, ServletResponse servletResponse) throws IOException, ServletException {
    if(_delegate != null) {
      _delegate.doFilter(servletRequest, servletResponse, _filterChain.get());
    } else {
      _filterChain.get().doFilter(servletRequest, servletResponse);
    }
  }

  @Override
  public void destroy() {
    _delegate.destroy();
  }
}