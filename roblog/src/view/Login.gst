<%@ extends ronin.RoninTemplate %>
<form method="post" action="${postUrlFor(controller.Admin.Type.TypeInfo.getMethod("doLogin", {String, String}))}">
Username: <input type="text" name="name"><br>
Password: <input type="password" name="pass"><br>
<input type="submit">
</form>