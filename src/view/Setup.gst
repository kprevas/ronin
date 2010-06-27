<%@ extends ronin.RoninTemplate %>
<%@ params(blogInfo : db.roblog.BlogInfo) %>
<html>
<title>Roblog - setup</title>
<body>
<form method="post" action="${postUrlFor(controller.Admin.Type.TypeInfo.getMethod("editInfo", {db.roblog.BlogInfo}))}">
<% if(!blogInfo._New) { %>
<input type="hidden" name="blogInfo" value="${blogInfo.id}">
<% } %>
Blog title: <input type="text" name="blogInfo.Title" value="${blogInfo.Title == null ? "" : blogInfo.Title}"><br>
<input type="submit">
</form>
</body>
</html>