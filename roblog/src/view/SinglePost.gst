<%@ extends ronin.RoninTemplate %>
<%@ params(aPost : db.roblog.Post, showPost()) %>
<% uses db.roblog.* %>
<% uses controller.* %>

<% showPost() %>

<% for(comment in aPost.Comments) { %>
    <div class="comment">
    <div class="commentAuthor">${comment.Name} - ${comment.Posted}</div>
    <div class="commentBody">${comment.Text}</div>
    </div>
<% } %>

<div class="newCommentForm">
  <form action="${postUrlFor(PostCx.Type.TypeInfo.getMethod("addComment", {Post, Comment}))}" method="post">
    <input type="hidden" name="post" value="${aPost.id}">
    Name: <input type="text" name="comment.Name"><br>
    Comment:<br>
    <textarea name="comment.Text" rows=5 columns=60></textarea><br>
    <input type="submit">
  </form>
</div>