const post = require("./postController");
const jwtMiddleware = require("../../../config/jwtMiddleware");

module.exports = function(app) {
    const post = require('./postController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 8. 해당 포스트의 댓글 불러오기
    app.get('/app/posts/comments',post.getCommentPage);

    // 11. 포스트 좋아요/좋아요 취소 누르는 API
    app.put('/app/posts/like',jwtMiddleware,post.postLikePost);

    // 12. 댓글 좋아요.좋아요 취소 누르는 API -> comment table과 like_for_comment 테이블의 numofLikes도 같이 연동
    app.put('/app/posts/comments/like',jwtMiddleware,post.postLikeComment);

    //13. 대댓글 좋아요/ 좋아요 취소 누르는 API
    app.put('/app/posts/replies/like',jwtMiddleware,post.postLikeReply);

    //14. 포스트 작성 API
    app.post('/app/posts',jwtMiddleware,post.createPost);

    //15. 포스트 내용 수정 API
    app.put('/app/posts/update',jwtMiddleware,post.updatePost);
    //16. 포스트 장소 수정 API
    /* app.put('/app/posts/update',post.updatePostPlace);*/

    //17. 댓글 수정 API
    app.put('/app/posts/comments/update',jwtMiddleware,post.updateComment);

    //18. 대댓글 수정 API
    app.put('/app/posts/replies/update',jwtMiddleware,post.updateReply);

    //19. 댓글 작성 API
    app.post('/app/posts/comments',jwtMiddleware,post.createComment);

    //20. 대댓글 작성 API
    app.post('/app/posts/replies',jwtMiddleware,post.createReply);




};