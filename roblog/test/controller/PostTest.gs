package controller

uses java.util.Date

uses org.junit.*
uses ronin.test.*

uses db.roblog.*
uses controller.PostCx

class PostTest extends Assert {

  static var posts : List<Post> = {}

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

  @Test function testViewPost() {
    var resp = RoninTest.get(PostCx#viewPost(posts[0]))
    assertTrue(resp.WriterBuffer.toString().contains("Post 1"))
    assertTrue(resp.WriterBuffer.toString().contains("Post 1 body"))
  }

  @Test function testAll() {
    var resp = RoninTest.get(PostCx#all(0))
    assertTrue(resp.WriterBuffer.toString().contains("Post 1"))
    assertTrue(resp.WriterBuffer.toString().contains("Post 1 body"))
    assertTrue(resp.WriterBuffer.toString().contains("Post 2"))
    assertTrue(resp.WriterBuffer.toString().contains("Post 2 body"))
  }

  @Test function testPrev() {
    var resp = RoninTest.get(PostCx#prev(posts[1]))
    RoninTest.assertRedirect(resp, "/PostCx/viewPost?post=1")
  }

  @Test function testNext() {
    var resp = RoninTest.get(PostCx#next(posts[0]))
    RoninTest.assertRedirect(resp, "/PostCx/viewPost?post=2")
  }

  @Test function testAddComment() {
    var comment = new Comment() {
      :Name = "Fred",
      :Text = "Comment text",
      :Posted = Date.Today
    }
    var resp = RoninTest.post(PostCx#addComment(posts[0], comment))
    RoninTest.assertRedirect(resp, "/PostCx/viewPost?post=1")
    assertEquals(1, Comment.find(null))
  }

}