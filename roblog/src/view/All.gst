<%@ extends ronin.RoninTemplate %>
<%@ params(page : int) %>
<% uses controller.PostCx %>
<% uses db.roblog.Post %>

<div class="header">All Posts</div>

<% for(aPost in Post.findSortedPaged(null, Post#Posted, false, 20, page * 20)) { %>
    <div class="postListEntry">
    <a href="${urlFor(PostCx#viewPost(aPost))}">${aPost.title}</a>
    </div>
<% }
   log(\-> "This is a test of lazy logging...")
 %>

<div class="paging">
<% if (page > 0) { %>
    <a href="${urlFor(PostCx#all(page - 1))}">Prev</a>
<% }
   if ((page == null ? 1 : page + 1) * 20 < Post.count(null)) { %>
    <a href="${urlFor(PostCx#all(page == null ? 1 : page + 1))}">Next</a>
<% } %>
</div>