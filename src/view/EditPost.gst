<%@ extends gw.simpleweb.SimpleWebTemplate %>
<%@ params(post : db.roblog.Post) %>
<form method="post" action="${postUrlFor(controller.Admin.Type.TypeInfo.getMethod("savePost", {db.roblog.Post}))}">
<% if(not post._New) { %>
<input type="hidden" name="post" value="${post.id}">
<% } %>
<input type="text" name="post.Title" value="${h(post.Title)}"><br>
<textarea name="post.Body" rows=20 columns=80>${h(post.Body)}</textarea><br>
<input type="submit">
</form>