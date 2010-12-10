<%@ extends ronin.RoninTemplate %>
<%@ params(user : String, title : String, content()) %>
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
      <div class="sidebarLink"><a href="${urlFor(\ -> Post.recent(0))}">All posts</a></div>
      <% if (user == "admin") { %>
          <div class="sidebarLink"><a href="${urlFor(\ -> Admin.newPost())}">Write a new post</a></div>
          <div class="sidebarLink"><a href="${urlFor(\ -> Admin.setup())}">Blog setup</a></div>
      <% } %>
      <div id="loginLogout">
      <% if (user != null) { %>
          Logged in as ${user} - <a href="${urlFor(\ -> Admin.logout())}">Logout</a>
      <% } else { %>
          <a href="${urlFor(\ -> Admin.login())}">Login</a>
      <% } %>
      </div>
    </div>
    <div id="content"><% content() %></div>
  </body>
</html>