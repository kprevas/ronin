package controller

uses db.roblog.Post
uses db.roblog.Comment
uses db.roblog.BlogInfo
uses ronin.RoninController

class Post extends RoninController {

  static function index() {
    var blogInfos = BlogInfo.find(null)
    if(blogInfos.Empty) {
      Admin.setup()
    } else {
      all(0)
    }
  }

  static function viewPost(post : Post) {
    var prevLink = Post.countWithSql("select count(*) as count from \"Post\" where \"Posted\" < '${post.Posted.toString()}'") > 0
    var nextLink = Post.countWithSql("select count(*) as count from \"Post\" where \"Posted\" > '${post.Posted.toString()}'") > 0
    view.Layout.render(Writer, Session["User"] as String, post.Title,
      \ -> view.SinglePost.render(Writer, post,
        \ -> view.ViewPost.render(Writer, post, prevLink, nextLink, Session["User"] == "admin", false)))
  }

  static function all(page : int) {
    view.Layout.render(Writer, Session["User"] as String, "All Posts", \ -> view.All.render(Writer, page))
  }

  static function prev(post : Post) {
    var prevPosts = Post.findWithSql("select * from \"Post\" where \"Posted\" < '${post.Posted.toString()}' order by \"Posted\" DESC")
    if(!prevPosts.Empty) {
        redirect(\ -> viewPost(prevPosts[0]))
    } else {
        redirect(\ -> viewPost(post))
    }
  }

  static function next(post : Post) {
    var nextPosts = Post.findWithSql("select * from \"Post\" where \"Posted\" > '${post.Posted.toString()}' order by \"Posted\" ASC")
    if(!nextPosts.Empty) {
        redirect(\ -> viewPost(nextPosts[0]))
    } else {
        redirect(\ -> viewPost(post))
    }
  }

  static function recent(page : int) {
    if(page == null) {
        page = 0
    }
    var posts = Post.findSortedPaged(null, Post.Type.TypeInfo.getProperty("Posted"), false, 20, page * 20)
    var more = Post.count(null) > (page + 1) * 20
    view.Layout.render(Writer, Session["User"] as String, "Recent posts",
      \ -> view.Recent.render(Writer, posts,
        \ post -> view.ViewPost.render(Writer, post, false, false, Session["User"] == "admin", true),
      more, page))
  }

  static function addComment(post : Post, comment : Comment) {
    comment.Posted = new java.sql.Timestamp(java.lang.System.currentTimeMillis())
    comment.Post = post
    comment.update()
    redirect(\ -> viewPost(post))
  }
}