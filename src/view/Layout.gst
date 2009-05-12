<%@ extends gw.simpleweb.SimpleWebTemplate %>
<%@ params(title : String, content()) %>
<html>
<head>
<link href="/public/blog.css" rel="stylesheet" type="text/css">
<% var blogTitle = db.roblog.BlogInfo.find(null)[0].Title %>
<title>${blogTitle} : ${h(title)}</title>
</head>
<body>
<div id="blogTitle">${blogTitle}</div>
<div id="sidebar">
<div class="sidebarLink"><a href="${urlFor(\ -> controller.Post.all(0))}">All posts</a></div>
<div class="sidebarLink"><a href="${urlFor(\ -> controller.Admin.newPost())}">Write a new post</a></div>
<div class="sidebarLink"><a href="${urlFor(\ -> controller.Admin.setup())}">Blog setup</a></div>
</div>
<div id="content"><% content() %></div>
</body>
</html>
