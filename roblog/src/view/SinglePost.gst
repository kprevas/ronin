<%@ extends ronin.RoninTemplate %>
<%@ params(aPost : db.roblog.Post, showPost()) %>
<% uses db.roblog.* %>
<% uses controller.* %>

<% showPost()  %>

<% for(comment in aPost.Comments) { %>
    <div class="comment">
    <div class="commentAuthor">${comment.Name} - ${comment.Posted}</div>
    <div class="commentBody">${comment.Text}</div>
    </div>
<% } %>

<div class="newCommentForm">
<% using(target(PostCx#addComment(Post, Comment))) { %>
  <form action="${TargetURL}" method="post">
    <input type="hidden" name="${n(aPost)}" value="${aPost.id}">
    ${Strings.Name}: <input type="text" name="${n(Comment#Name)}"><br>
    ${Strings.Comment}:<br>
    <textarea name="${n(Comment#Text)}" rows=5 columns=60></textarea><br>
    <input type="submit">
  </form>
<% } %>
</div>