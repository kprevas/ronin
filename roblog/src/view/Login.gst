<%@ extends ronin.RoninTemplate %>
<% uses controller.* %>

<form method="post" action="${postUrlFor(AdminCx.Type.TypeInfo.getMethod("doLogin", {String, String}))}">
  Username: <input type="text" name="name"><br>
  Password: <input type="password" name="pass"><br>
  <input type="submit">
</form>