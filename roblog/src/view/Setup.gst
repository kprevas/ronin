<%@ extends ronin.RoninTemplate %>
<%@ params(blogInfo : db.roblog.BlogInfo) %>
<% uses db.roblog.BlogInfo
   uses controller.* %>

<html>
  <title>Roblog - setup</title>
  <body>
  <% using(target(AdminCx#editInfo(BlogInfo))) { %>
    <form method="post" action="${TargetURL}">
      <% if(!blogInfo._New) { %>
          <input type="hidden" name="${n(blogInfo)}" value="${blogInfo.id}">
      <% } %>
      Blog title: <input type="text" name="${n(blogInfo#Title)}" value="${blogInfo.Title ?: blogInfo.Title}"><br>
      <input type="submit">
    </form>
  <% } %>
  </body>
</html>