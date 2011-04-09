<%@ extends ronin.RoninTemplate %>
<% uses controller.* %>

<% using(target(AdminCx#doLogin(String, String))) { %>
  <form method="post" action="${TargetURL}">
    ${strings.Username}: <input type="text" name="${n(0)}"><br>
    ${strings.Password}: <input type="password" name="${n(1)}"><br>
    <input type="submit">
  </form>
  <div>
    <a href="${urlFor(OpenID#login(OpenID.GOOGLE, urlFor(PostCx#recent(0))))}">
      Log in with your Google account
    </a>
  </div>
  <div>
    <% using(target(OpenID#login(String, String, boolean, String))) { %>
      <form method="post" action="${TargetURL}">
        <input type="hidden" name="${n(0)}" value="${OpenID.VERISIGN}"/>
        <input type="hidden" name="${n(1)}" value="${urlFor(PostCx#recent(0))}"/>
        Log in with your Verisign PIP account: <input type="text" name="${n(3)}"/>
        <input type="submit" value="Go"/>
      </form>
    <% } %>
  </div>
<% } %>