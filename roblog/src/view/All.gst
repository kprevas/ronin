<%@ extends ronin.RoninTemplate %>
<%@ params(page : java.lang.Integer) %>
<% uses controller.PostCx %>
<% uses db.roblog.Post %>

<div class="header">${Strings.AllPosts}</div>

<% for(aPost in Post.selectAll().orderBy(Post#Posted, DESC).page(:startPage = page, :pageSize = 20).loadPage()) { %>
    <div class="postListEntry">
    <a href="${urlFor(PostCx#viewPost(aPost))}">${aPost.Title}</a>
    </div>
<% }
   log(\-> "This is a test of lazy logging...")
 %>

<div class="paging">
<% if (page > 0) { %>
    <a href="${urlFor(PostCx#all(page - 1))}">${Strings.Prev}</a>
<% }
   if ((page == null ? 1 : page + 1) * 20 < Post.countAll()) { %>
    <a href="${urlFor(PostCx#all(page == null ? 1 : page + 1))}">${Strings.Next}</a>
<% } %>
</div>