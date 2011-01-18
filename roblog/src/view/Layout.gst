<%@ extends ronin.RoninTemplate %>
<%@ params(title : String, content()) %>
<% uses db.roblog.BlogInfo %>
<% uses controller.* %>

<html>
  <head>
    <link href="/public/blog.css" rel="stylesheet" type="text/css">
    <% var blogTitle = BlogInfo.find(null)[0].Title %>
    <title>${blogTitle} : ${h(title)}</title>
  </head>
  <body>
    <div id="blogTitle">${blogTitle}</div>
    <div id="sidebar">
      <div class="sidebarLink"><a href="${urlFor(PostCx#recent(0))}">All posts</a></div>
      <% if (AuthManager.CurrentUserName == "admin") { %>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#newPost())}">Write a new post</a></div>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#setup())}">Blog setup</a></div>
      <% } %>
      <div id="loginLogout">
      <% if (AuthManager.CurrentUserName != null) { %>
          Logged in as ${AuthManager.CurrentUserName} - <a href="${urlFor(AdminCx#logout())}">Logout</a>
      <% } else { %>
          <a href="${urlFor(AdminCx#login())}">Login</a>
      <% } %>
      </div>
    </div>
    <div id="content"><% content() %></div>
  </body>
</html>