<%@ extends ronin.RoninTemplate %>
<% uses controller.* %>

<% using(target(AdminCx#doLogin(String, String))) { %>
  <form method="post" action="${TargetURL}">
    ${strings.Username}: <input type="text" name="${n(0)}"><br>
    ${strings.Password}: <input type="password" name="${n(1)}"><br>
    <input type="submit">
  </form>
  <a href="${urlFor(OpenID#login(OpenID.GOOGLE, urlFor(PostCx#recent(0))))}">
    Log in with your Google account
  </a>
<% } %>