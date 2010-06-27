<%@ extends ronin.RoninTemplate %>
<%@ params(post : db.roblog.Post, showPost()) %>
<% showPost() %>
<% for(comment in post.Comments) { %>
<div class="comment">
<div class="commentAuthor">${comment.Name} - ${comment.Posted}</div>
<div class="commentBody">${comment.Text}</div>
</div>
<% } %>
<div class="newCommentForm">
<form action="${postUrlFor(controller.Post.Type.TypeInfo.getMethod("addComment", {db.roblog.Post, db.roblog.Comment}))}" method="post">
<input type="hidden" name="post" value="${post.id}">
Name: <input type="text" name="comment.Name"><br>
Comment:<br>
<textarea name="comment.Text" rows=5 columns=60></textarea><br>
<input type="submit">
</form>
</div>