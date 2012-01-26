package ronin;

import javax.servlet.Filter;
import javax.servlet.http.HttpServlet;

public abstract class AbstractRoninServlet extends HttpServlet {
  public abstract Filter getFilter();
}
