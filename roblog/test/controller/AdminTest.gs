package controller

uses java.util.Date

uses org.junit.*
uses ronin.test.*

uses db.roblog.*
uses controller.AdminCx

class AdminTest extends Assert {

  static var posts : List<Post>

  @BeforeClass static function initSampleData() {
    Post.find(null).each(\p -> p.delete())
    posts = {
      new Post(){
        :Title = "Post 1",
        :Body = "Post 1 body",
        :Posted = Date.Yesterday
      },
      new Post(){
        :Title = "Post 2",
        :Body = "Post 2 body",
        :Posted = Date.Today
      }
    }
    posts.each(\p -> p.update());
  }

  @Test function testEditPost() {
    var resp = RoninTest.get(AdminCx#editPost(posts[0]))
    assertTrue(resp.WriterBuffer.toString().contains("Post 1"))
  }

  @Test function testDeletePost() {
    var post = new Post() {
      :Title = "new post",
      :Body = "new post body",
      :Posted = Date.Today
    }
    post.update()
    assertEquals(3, Post.find(null).Count)
    RoninTest.post(AdminCx#deletePost(post))
    assertEquals(2, Post.find(null).Count)
    assertFalse(Post.find(null).contains(post))
  }

  @Test function testSavePost() {
    posts[0].Body = "edited post 1 body"
    RoninTest.post(AdminCx#savePost(posts[0]))
    assertEquals(posts[0].Body, Post.fromId(posts[0].id).Body)
  }

}