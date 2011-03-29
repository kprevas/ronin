<%@ extends ronin.RoninTemplate %>
<% uses controller.* %>

<% using(target(AdminCx#doLogin(String, String))) { %>
  <form method="post" action="${TargetURL}">
    Username: <input type="text" name="name"><br>
    Password: <input type="password" name="pass"><br>
    <input type="submit">
  </form>
  <a href="${urlFor(OpenID#login("https://www.google.com/accounts/o8/id", urlFor(PostCx#recent(0))))}">
    Log in with your Google account
  </a>
<% } %>