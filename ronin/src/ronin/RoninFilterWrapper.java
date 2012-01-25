package ronin;

import javax.servlet.*;
import java.io.IOException;

public class RoninFilterWrapper implements Filter {
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
    AbstractRoninServlet roninServlet = (AbstractRoninServlet) servletRequest.getServletContext().getAttribute(RoninServletWrapper.RONIN_SERVLET_SLOT);
    roninServlet.getFilter().doFilter(servletRequest, servletResponse, filterChain);
  }

  @Override
  public void destroy() {
  }
}
