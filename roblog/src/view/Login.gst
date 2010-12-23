<%@ extends ronin.RoninTemplate %>
<% uses controller.* %>

<% using(target(AdminCx#doLogin(String, String))) { %>
  <form method="post" action="${TargetURL}">
    Username: <input type="text" name="name"><br>
    Password: <input type="password" name="pass"><br>
    <input type="submit">
  </form>
<% } %>