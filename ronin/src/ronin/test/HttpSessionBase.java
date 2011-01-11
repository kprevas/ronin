/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Jan 10, 2011
 * Time: 10:07:56 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin.test;

import javax.servlet.http.HttpSession;

/**
 * TODO remove me when http://code.google.com/p/gosu-lang/issues/detail?id=53 is fixed
 *
 * @author kprevas
 */
public abstract class HttpSessionBase implements HttpSession {
  @Override
  public boolean isNew() {
    return false;
  }
}