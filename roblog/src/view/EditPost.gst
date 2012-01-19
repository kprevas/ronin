<%@ extends ronin.RoninTemplate %>
<%@ params(post : db.roblog.Post) %>
<% uses controller.* %>
<% uses db.roblog.Post %>

<% using(target(AdminCx#savePost(db.roblog.Post))) { %>
  <form method="post" action="${TargetURL}">
    <% if(not post.New) { %>
        <input type="hidden" name="${n(post)}" value="${post.id}">
    <% } %>
    <input type="text" name="${n(post#Title)}" value="${h(post.Title)}"><br>
    <textarea name="${n(post#Body)}" rows=20 columns=80>${h(post.Body)}</textarea><br>
    <input type="submit">
  </form>
<% } %>