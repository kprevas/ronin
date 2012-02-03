package controller

uses db.roblog.Post
uses db.roblog.Comment
uses db.roblog.BlogInfo
uses ronin.RoninController
uses ronin.NoAuth

@NoAuth
class PostCx extends RoninController {

  function index() {
    var blogInfos = BlogInfo.selectAll()
    if(not blogInfos.HasElements) {
      new AdminCx().setup()
    } else {
      all(0)
    }
  }

  function viewPost(p : Post) {
    var prevLink = Post.countWhere("\"Posted\" < :p", {"p" -> p.PostedSQL}) > 0
    var nextLink = Post.countWhere("\"Posted\" > :p", {"p" -> p.PostedSQL}) > 0
    view.Layout.render(Writer, p.Title,
      \ -> view.SinglePost.render(Writer, p,
        \ -> view.ViewPost.render(Writer, p, prevLink, nextLink, AuthManager.CurrentUserName == "admin", false)))
  }

  function all(page : int) {
    view.Layout.render(Writer, "All Posts", \ -> view.All.render(Writer, page))
  }

  function prev(p: Post) {
    var prevPosts = Post.select("\"Posted\" < :date order by \"Posted\" DESC", {"date" -> p.PostedSQL})
    if (prevPosts.HasElements) {
      redirect(#viewPost(prevPosts.first()))
    } else {
      redirect(#viewPost(p))
    }
  }

  function next(p : Post) {
    var nextPosts = Post.select("\"Posted\" > :date order by \"Posted\" ASC", {"date" -> p.PostedSQL})
    if(nextPosts.HasElements) {
        redirect(#viewPost(nextPosts.first()))
    } else {
        redirect(#viewPost(p))
    }
  }

  function recent(page : int) {
    if(page == null) {
        page = 0
    }
    var posts = Post.findSortedPaged(null, Post#Posted, false, 20, page * 20)
    var more = Post.countAll() > (page + 1) * 20
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