<%@ extends ronin.RoninTemplate %>
<%@ params(page : int) %>
<% uses controller.Post %>

<div class="header">All Posts</div>

<% for(aPost in db.roblog.Post.findSortedPaged(null, \p : db.roblog.Post -> p.Posted, false, 20, page * 20)) { %>
    <div class="postListEntry">
    <a href="${urlFor(\-> Post.viewPost(aPost))}">${aPost.title}</a>
    </div>
<% } %>

<div class="paging">
<% if (page > 0) { %>
    <a href="${urlFor(\-> Post.all(page - 1))}">Prev</a>
<% }
   if ((page == null ? 1 : page + 1) * 20 < db.roblog.Post.count(null)) { %>
    <a href="${urlFor(\-> Post.all(page == null ? 1 : page + 1))}">Next</a>
<% } %>
</div>