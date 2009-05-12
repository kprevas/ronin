<%@ extends gw.simpleweb.SimpleWebTemplate %>
<html>
<title>Roblog - new post</title>
<body>
<form method="post" action="${postUrlFor(controller.Admin.Type.TypeInfo.getMethod("create", {db.roblog.Post}))}">
<input type="text" name="post.Title"><br>
<textarea name="post.Body"></textarea><br>
<input type="submit">
</form>