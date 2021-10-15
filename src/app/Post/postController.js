const jwtMiddleware = require("../../../config/jwtMiddleware");
const postProvider = require("../../app/Post/postProvider");
const postService = require("../../app/Post/postService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");


/**
 * API No. 8
 * API Name : 해당 포스트의 댓글창 보여주기
 *
 * [GET] /app/posts/comments/:postId
 *
 */
exports.getCommentPage= async function (req, res) {
    /**
     * body: postId
     *
     */

    const {postId} = req.body;

    if (!postId) return res.send(errResponse(baseResponse.POST_ID_EMPTY));
    const commentsByPostId = await postProvider.retrieveCommentPage(postId);
    return res.send(response(baseResponse.SUCCESS, commentsByPostId));


};

/**
 * API No. 11
 * API Name : 해당 포스트 좋아요 누르는 API
 *
 * [POST] /app/posts/like_post
 *
 */
exports.postLikePost= async function (req, res) {
    /**
     * Body : userId, postId
     */
    const {userId, postId} =req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!postId) return res.send(errResponse(baseResponse.POST_POSTID_EMPTY));
    const userIdFromJWT = req.verifiedToken.userId
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else {
        const likePostResponse = await postService.postLikedByUser(
            userId,
            postId

        );
        const checkSendAlertResponse = await postProvider.checkSendAlert(userId,postId);
        console.log(checkSendAlertResponse);
        if(checkSendAlertResponse!=''){
            const sendLikeAlertResponse = await postService.postLikedAlert(userId, postId);
        }

        return res.send(baseResponse.SUCCESS);
    }
};

/**
 * API No. 12
 * API Name : 해당 댓글 좋아요 누르는 API
 *
 * [POST] /app/posts/like_comment
 *
 */
exports.postLikeComment= async function (req, res) {
    /**
     * Body : userId, commentId
     */
    const {userId, commentId} =req.body;
    const userIdFromJWT = req.verifiedToken.userId
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{
        if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
        if (!commentId) return res.send(errResponse(baseResponse.COMMENT_COMMENTID_EMPTY));


        const likeCommentResponse = await postService.commentLikedByUser(
            userId,
            commentId

        );


        return res.send(likeCommentResponse);
    }
};


/**
 * API No. 13
 * API Name : 해당 대댓글 좋아요 누르는 API
 *
 * [POST] /app/posts/like_reply
 *
 */
exports.postLikeReply= async function (req, res) {
    /**
     * Body : userId, replyId
     */
    const {userId, replyId} =req.body;
    const userIdFromJWT = req.verifiedToken.userId;
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{
        if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
        if (!replyId) return res.send(errResponse(baseResponse.POST_REPLYID_EMPTY));
        //경고 바꿔주기.....


        const likeReplyResponse = await postService.replyLikedByUser(
            userId,
            replyId

        );

        return res.send(likeReplyResponse);}
};



/**
 * API No. 14
 * API Name : 포스트 작성 API
 *
 * [POST] /app/posts/new_post
 *
 */
exports.createPost= async function (req, res) {
    /**
     * Body : userId, placeName,postContent
     */
    const {userId, placeName,postContent,postImage} =req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));


    const userIdFromJWT = req.verifiedToken.userId;
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{


        //경고 바꿔주기.....


        const createPostResponse = await postService.createPostByUser(
            userId, placeName,postContent

        );

        return res.send(createPostResponse);}
};


/**
 * API No. 15
 * API Name : 포스트 내용 수정 API
 *
 * [POST] /app/posts/update_post
 *
 */
exports.updatePost= async function (req, res) {
    /**
     * Body : postId, postContent, placeName, userId
     */
    const { postContent,postId, placeName,userId} =req.body;
    const userIdFromJWT = req.verifiedToken.userId;
    if (!postId) return res.send(errResponse(baseResponse.POST_POSTID_EMPTY));
    if (!postContent) return res.send(errResponse(baseResponse.POST_CONTENT_EMPTY));
    if (!placeName) return res.send(errResponse(baseResponse.POST_PLACENAME_EMPTY));//경고 바꿔주기.....
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const updatePostResponse = await postService.updatePostByUser(
            postContent, postId, placeName
        );

        return res.send(updatePostResponse);}
};
/*
*
 * API No. 16
 * API Name : 포스트 장소 수정 API
 *
 * [POST] /app/posts/update_post_place
 *

exports.updatePostPlace= async function (req, res) {
    /**
     * Body : postId, placeName

    const { placeName,postId} =req.body;

    if (!postId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    //경고 바꿔주기.....


    const updatePostResponse = await postService.updatePostPlaceName(
       placeName, postId
    );

    return res.send(updatePostResponse);
};

*/

/**
 * API No. 17
 * API Name : 댓글 수정 API
 *
 * [POST] /app/posts/update_comment
 *
 */
exports.updateComment= async function (req, res) {
    /**
     * Body : content, userId, commentId
     */
    const {  commentContent, userId,commentId } =req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!commentId) return res.send(errResponse(baseResponse.POST_COMMENTID_EMPTY));
    if (!commentContent) return res.send(errResponse(baseResponse.POST_CONTENT_EMPTY));
    const userIdFromJWT = req.verifiedToken.userId;
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }else{


        const updateReplyResponse = await postService.updateComment(
            commentContent, userId, commentId
        );

        return res.send(updateReplyResponse);}
};

/**
 * API No. 18
 * API Name : 대댓글 수정 API
 *
 * [POST] /app/posts/update_comment
 *
 */
exports.updateReply= async function (req, res) {
    /**
     * Body : content, userId, replyId
     */

    const userIdFromJWT = req.verifiedToken.userId;
    const {  content, userId, replyId } =req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!content) return res.send(errResponse(baseResponse.POST_CONTENT_EMPTY));
    if (!replyId) return res.send(errResponse(baseResponse.POST_REPLYID_EMPTY));

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else {

        const updateCommentResponse = await postService.updateReply(
            content, userId, replyId
        );

        return res.send(updateCommentResponse);
    }
};

/**
 * API No. 19
 * API Name : 댓글 생성
 *
 * [POST] /app/posts/new_comment
 *
 */

exports.createComment = async function (req, res) {
    /**
     * Body : userId,  content
     */
    const { userId, postId, commentContent } = req.body;
    const userIdFromJWT = req.verifiedToken.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!postId) return res.send(errResponse(baseResponse.POST_POSTID_EMPTY));
    if (!commentContent) return res.send(errResponse(baseResponse.POST_CONTENT_EMPTY));

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const createCommentResponse = await postService.createComment(
            userId, postId, commentContent
        );


        return res.send(createCommentResponse);}

};
/**
 * API No. 20
 * API Name : 대댓글 작성 API
 *
 * [POST] /app/posts/new_reply
 *
 */
exports.createReply= async function (req, res) {
    /**
     * Body : userId, commentId, content
     */
    const userIdFromJWT = req.verifiedToken.userId;
    const { userId, commentId, content} =req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!commentId) return res.send(errResponse(baseResponse.POST_COMMENTID_EMPTY));
    if (!content) return res.send(errResponse(baseResponse.POST_CONTENT_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const updateReplyResponse = await postService.createReply(
            userId, commentId, content
        );

        return res.send(updateReplyResponse);
    }
};