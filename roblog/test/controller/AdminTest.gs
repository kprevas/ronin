package controller

uses java.util.Date

uses org.junit.*
uses ronin.test.*

uses db.roblog.*
uses controller.AdminCx

class AdminTest extends Assert {

  static var posts : List<Post>

  @BeforeClass static function initSampleData() {
    Post.selectLike(new ()).each(\p -> p.delete())
    posts = {
      new() {
        :Title = "Post 1",
        :Body = "Post 1 body",
        :Posted = Date.Yesterday
      },
      new() {
        :Title = "Post 2",
        :Body = "Post 2 body",
        :Posted = Date.Today
      }
    }
    posts.each(\p -> p.update());
  }

  @Test function testEditPost() {
    RoninTest.doAs(:action = \ -> {
      var resp = RoninTest.get(AdminCx#editPost(posts[0]))
      assertTrue(resp.WriterBuffer.toString().contains("Post 1"))
    }, :userName = "admin")
  }

  @Test function testDeletePost() {
    RoninTest.doAs(:action = \ -> {
      var p = new Post() {
        :Title = "new post",
        :Body = "new post body",
        :Posted = Date.Today
      }
      p.update()
      var pre = Post.countLike(new())
      RoninTest.post(AdminCx#deletePost(p))
      assertEquals(pre - 1, Post.countLike(new()))
      assertFalse(Post.selectLike(new ()).toList().contains(p))
    }, :userName = "admin")
  }

  @Test function testSavePost() {
    RoninTest.doAs(:action = \ -> {
      posts[0].Body = "edited post 1 body"
      RoninTest.post("/AdminCx/savePost", {
        "post" -> {posts[0].id as String},
        "post.Body" -> {posts[0].Body}
      })
      assertEquals(posts[0].Body, Post.fromId(posts[0].id).Body)
    }, :userName = "admin")
  }

}