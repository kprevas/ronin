<%@ extends ronin.RoninTemplate %>
<%@ params(title : String, content()) %>
<% uses db.roblog.BlogInfo %>
<% uses controller.* %>
<% uses java.text.MessageFormat %>

<html>
  <head>
    <link href="/public/blog.css" rel="stylesheet" type="text/css">
    <meta http-equiv="X-XRDS-Location" content="${urlFor(OpenID#xrds())}"/>
    <% var blogTitle = BlogInfo.find(null)[0].Title %>
    <title>${blogTitle} : ${h(title)}</title>
  </head>
  <body>
    <div id="blogTitle">${blogTitle}</div>
    <div id="sidebar">
      <div class="sidebarLink"><a href="${urlFor(PostCx#recent(0))}">${strings.AllPosts}</a></div>
      <% if (AuthManager.CurrentUserName == "admin") { %>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#newPost())}">${strings.WriteNew}</a></div>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#setup())}">${strings.BlogSetup}</a></div>
      <% } %>
      <div id="loginLogout">
      <% if (AuthManager.CurrentUserName != null) { %>
          ${MessageFormat.format(strings.LoggedIn, {AuthManager.CurrentUserName})} - <a href="${urlFor(AdminCx#logout())}">${strings.Logout}</a>
      <% } else { %>
          <a href="${urlFor(AdminCx#login())}">${strings.Login}</a>
      <% } %>
      </div>
    </div>
    <div id="content"><% content() %></div>
  </body>
</html>