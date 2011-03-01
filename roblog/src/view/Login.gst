<%@ extends ronin.RoninTemplate %>
<% uses controller.* %>

<% using(target(AdminCx#doLogin(String, String))) { %>
  <form method="post" action="${TargetURL}">
    ${strings.Username}: <input type="text" name="name"><br>
    ${strings.Password}: <input type="password" name="pass"><br>
    <input type="submit">
  </form>
<% } %>