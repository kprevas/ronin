<%@ extends ronin.RoninTemplate %>
<%@ params(blogInfo : db.roblog.BlogInfo) %>
<% uses db.roblog.BlogInfo
   uses controller.* %>

<html>
  <title>${Strings.SetupTitle}</title>
  <body>
  <% using(target(AdminCx#editInfo(db.roblog.BlogInfo))) { %>
    <form method="post" action="${TargetURL}">
      <% if(not blogInfo.New) { %>
          <input type="hidden" name="${n(blogInfo)}" value="${blogInfo.id}">
      <% } %>
      ${Strings.BlogTitle}: <input type="text" name="${n(blogInfo#Title)}" value="${blogInfo.Title ?: ""}"><br>
      <input type="submit">
    </form>
  <% } %>
  </body>
</html>