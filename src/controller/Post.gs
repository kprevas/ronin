package controller

uses db.roblog.Post
uses gw.simpleweb.SimpleWebController

class Post extends SimpleWebController {

	static function viewPost(post : Post) {
	    var prevLink = Post.countWithSql("select count(*) as count from \"Post\" where \"Posted\" < '${post.Posted.toString()}'") > 0
	    var nextLink = Post.countWithSql("select count(*) as count from \"Post\" where \"Posted\" > '${post.Posted.toString()}'") > 0
		view.Layout.render(writer, post.Title, \ -> view.ViewPost.render(writer, post, prevLink, nextLink))
	}

	static function all(page : int) {
		view.Layout.render(writer, "All Posts", \ -> view.All.render(writer, page))
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
}