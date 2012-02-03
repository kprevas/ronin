<%@ extends ronin.RoninTemplate %>
<%@ params(title : String, content()) %>
<% uses db.roblog.BlogInfo %>
<% uses controller.* %>

<html>
  <head>
    <link href="/public/blog.css" rel="stylesheet" type="text/css">
    <meta http-equiv="X-XRDS-Location" content="${urlFor(OpenID#xrds())}"/>
    <% var blogTitle = BlogInfo.selectAll().first()?.Title ?: "" %>
    <title>${blogTitle} : ${h(title)}</title>
  </head>
  <body>
    <div id="blogTitle">${blogTitle}</div>
    <div id="sidebar">
      <div class="sidebarLink"><a href="${urlFor(PostCx#recent(0))}">${Strings.AllPosts}</a></div>
      <% if (AuthManager.CurrentUserName == "admin") { %>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#newPost())}">${Strings.WriteNew}</a></div>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#setup())}">${Strings.BlogSetup}</a></div>
      <% } %>
      <div id="loginLogout">
      <% if (AuthManager.CurrentUserName != null) { %>
          ${Strings.LoggedIn.formatMessage({AuthManager.CurrentUserName})} - <a href="${urlFor(AdminCx#logout())}">${Strings.Logout}</a>
      <% } else { %>
          <a href="${urlFor(AdminCx#login())}">${Strings.Login}</a>
      <% } %>
      </div>
    </div>
    <div id="content"><% content() %></div>
    <div id="footer">${util.FooterInfo.getFooterInfo()}</div>
  </body>
</html>