<%@ extends ronin.RoninTemplate %>
<%@ params(page : int) %>
<div class="header">All Posts</div>
<% for(post in db.roblog.Post.findSortedPaged(null, db.roblog.Post.Type.TypeInfo.getProperty("Posted"), false, 20, page * 20)) { %>
<div class="postListEntry">
<a href="${urlFor(\-> controller.Post.viewPost(post))}">${post.title}</a>
</div>
<% } %>
<div class="paging">
<% if (page > 0) { %>
<a href="${urlFor(\-> controller.Post.all(page - 1))}">Prev</a>
<% }
if ((page == null ? 1 : page + 1) * 20 < db.roblog.Post.count(null)) { %>
<a href="${urlFor(\-> controller.Post.all(page == null ? 1 : page + 1))}">Next</a>
<% } %>
</div>