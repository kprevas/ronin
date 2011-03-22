package controller

uses db.roblog.Post
uses db.roblog.Comment
uses db.roblog.BlogInfo
uses ronin.RoninController
uses ronin.NoAuth

@NoAuth
class PostCx extends RoninController {

  function index() {
    var blogInfos = BlogInfo.find(null)
    if(blogInfos.Empty) {
      new AdminCx().setup()
    } else {
      all(0)
    }
  }

  function viewPost(post : Post) {
    var prevLink = Post.countWithSql("select count(*) as count from \"Post\" where \"Posted\" < '${post.PostedSQL}'") > 0
    var nextLink = Post.countWithSql("select count(*) as count from \"Post\" where \"Posted\" > '${post.PostedSQL}'") > 0
    view.Layout.render(Writer, post.Title,
      \ -> view.SinglePost.render(Writer, post,
        \ -> view.ViewPost.render(Writer, post, prevLink, nextLink, AuthManager.CurrentUserName == "admin", false)))
  }

  function all(page : int) {
    view.Layout.render(Writer, "All Posts", \ -> view.All.render(Writer, page))
  }

  function prev(post : Post) {
    var prevPosts = Post.findWithSql("select * from \"Post\" where \"Posted\" < '${post.PostedSQL}' order by \"Posted\" DESC")
    if(!prevPosts.Empty) {
        redirect(#viewPost(prevPosts[0]))
    } else {
        redirect(#viewPost(post))
    }
  }

  function next(post : Post) {
    var nextPosts = Post.findWithSql("select * from \"Post\" where \"Posted\" > '${post.PostedSQL}' order by \"Posted\" ASC")
    if(!nextPosts.Empty) {
        redirect(#viewPost(nextPosts[0]))
    } else {
        redirect(#viewPost(post))
    }
  }

  function recent(page : int) {
    if(page == null) {
        page = 0
    }
    var posts = Post.findSortedPaged(null, Post#Posted, false, 20, page * 20)
    var more = Post.count(null) > (page + 1) * 20
    view.Layout.render(Writer, "Recent posts",
      \ -> view.Recent.render(Writer, posts,
        \ post -> view.ViewPost.render(Writer, post, false, false, AuthManager.CurrentUserName == "admin", true),
      more, page))
  }

  function addComment(post : Post, comment : Comment) {
    comment.Posted = new java.sql.Timestamp(java.lang.System.currentTimeMillis())
    comment.Post = post
    comment.update()
    redirect(#viewPost(post))
  }
}