package controller

uses db.roblog.Post
uses db.roblog.BlogInfo
uses gw.simpleweb.SimpleWebController

class Admin extends SimpleWebController {

	static function newPost() {
		view.Layout.render(writer, "New post", \ -> view.NewPost.render(writer))
	}

	static function create(post : Post) {
		post.Posted = new java.sql.Timestamp(java.lang.System.currentTimeMillis())
		post.update()
		redirect(\ -> controller.Post.viewPost(post))
	}

	static function setup() {
		var blogInfos = BlogInfo.find(null)
		var blogInfo : BlogInfo
		if(blogInfos.Empty) {
			blogInfo = new BlogInfo()
		} else {
			blogInfo = blogInfos[0]
		}
		view.Layout.render(writer, "Setup", \ -> view.Setup.render(writer, blogInfo))
	}
	
	static function editInfo(blogInfo : BlogInfo) {
	    blogInfo.update()
	    redirect(\ -> setup())
	}
}
