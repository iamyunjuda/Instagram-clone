const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const postProvider = require("./postProvider");
const postDao = require("./postDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");



exports.postLikedByUser = async function (userId, postId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        // 좋아요 중복 확인
        const userLikedParams = [userId, postId];
        const userLikedRows = await postProvider.postLikedCheck(userLikedParams);

        if (userLikedRows.length > 0){
            const updateUserLikedPostParams = [userId, postId];
            const likedPostResult = await postDao.updateUserLikedPost(connection, updateUserLikedPostParams);

        }

       else {

            const insertUserLikedPostParams = [userId, postId, postId];
            const likedPostResult = await postDao.insertUserLikedPost(connection, insertUserLikedPostParams);

        }

        const postNumberOfLikedSyncParams = [postId, postId];
        const postNumberOfLikedSync = await postDao.updatePostLikedNumber(connection, postNumberOfLikedSyncParams);
        await connection.commit();
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {

        await connection.rollback();
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }
};





exports.commentLikedByUser = async function (userId, commentId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        console.log(userId, commentId);
        // 좋아요 중복 확인
        const commentLikedParams = [userId, commentId];
        const commentLikedRows = await postProvider.commentLikedCheck(commentLikedParams);

        if (commentLikedRows.length > 0){
            //해당 댓글 좋아요를 이미 눌렀을 경우, table에서 status만 변경
            const updateUserLikedCommentParams = [userId, commentId];
            const likedCommentResult = await postDao.updateUserLikedComment(connection, updateUserLikedCommentParams);


        }
        else {
            const insertUserLikedCommentParams = [userId, commentId,commentId];
            const connection = await pool.getConnection(async (conn) => conn);
            const likedCommentResult = await postDao.insertUserLikedComment(connection, insertUserLikedCommentParams);



        }

        const commentNumberOfLikedSyncParams = [commentId, commentId];
        const commentNumberOfLikedSync = await postDao.updateCommentLikedNumber(connection, commentNumberOfLikedSyncParams);
        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};




exports.replyLikedByUser = async function (userId, replyId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        // 좋아요 중복 확인
        const replyLikedParams = [userId, replyId];
        const replyLikedRows = await postProvider.replyLikedCheck(replyLikedParams);


        if (replyLikedRows.length > 0){
            //해당 댓글 좋아요를 이미 눌렀을 경우, table에서 status만 변경
            const updateUserLikedReplyParams = [userId, replyId];
            const likedReplyResult = await postDao.updateUserLikedReply(connection, updateUserLikedReplyParams);
            connection.release();

        }
        else {
            const insertUserLikedReplyParams = [userId, replyId, replyId];
            const likedReplyResult = await postDao.insertUserLikedReply(connection, insertUserLikedReplyParams);
            connection.release();

        }

        const replyNumberOfLikedSyncParams = [replyId, replyId];
        const replyNumberOfLikedSync = await postDao.updateReplyLikedNumber(connection, replyNumberOfLikedSyncParams);
        await connection.commit();
        return response(baseResponse.SUCCESS);



    } catch (err) {

        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

//글 작성하기
exports.createPostByUser = async function (userId, placeName,postContent) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const insertPostInfoParams = [userId, placeName,postContent];



        const createPostResult = await postDao.insertPost(connection, insertPostInfoParams);
        await connection.commit();
        connection.release();
        return response(userId);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
//포스트 장소 수정
exports.updatePostPlaceName = async function ( placeName,postId) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const updatePostInfoParams = [placeName, postId];

      //  const connection = await pool.getConnection(async (conn) => conn);

        const updatePostResult = await postDao.updatePostPlaceName(connection, updatePostInfoParams);
        await connection.commit();
        connection.release();
        return response(userId);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};



//포스트 글 내용
exports.updatePostByUser = async function (postContent,postId, placeName) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const updatePostPlaceInfoParams = [postContent, placeName, postId];
        const updatePostResult = await postDao.updatePost(connection, updatePostPlaceInfoParams);
        await connection.commit();
        connection.release();
        return response(postId);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


//댓글 수정하기

exports.updateComment = async function (commentContent, userId, commentId  ) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const updateCommentParams = [ commentContent, userId, commentId  ];
        const updateCommentResult = await postDao.updateComment(connection, updateCommentParams);
        connection.release();
        await connection.commit();
        return response(userId);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
//대댓글 수정
exports.updateReply= async function (content, userId, replyId  ) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        const updateCommentParams = [ content, userId, replyId ];
        const updateReplyResult = await postDao.updateReply(connection, updateCommentParams);
        await connection.commit();
        connection.release();
        return response(userId);


    } catch (err) {
        await connection.rollback();
        connection.release();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


//댓글 작성
//글 작성하기
exports.createComment = async function (userId, postId, commentContent ) {

    const connection = await pool.getConnection(async (conn) => conn);


    try {
        await connection.beginTransaction();

        const insertCommentParams = [userId, postId, commentContent ];
        const createCommentResult = await postDao.createComment(connection, insertCommentParams);
      //  const updateNumOfCommentParams = [postId, postId];
       // const updateNumOfComment = await postDao.updateNumOfComment(updateNumOfCommentParams);

        await connection.commit();
        await connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        await connection.rollback();
       await connection.release();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }


};




exports.createReply= async function (userId, commentId, content) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const createReplyParams = [ userId, commentId, content ];
        const createReplyResult = await postDao.createReply(connection, createReplyParams);
        await connection.commit();

        return response(baseResponse.SUCCESS);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    //const updateNumOfReplyParams =[commentId,commentId];
   // const connection = await pool.getConnection(async (conn) => conn);
  //  const updateNumOfReply = await postDao.updateNumOfReply(updateNumOfReplyParams);

  //  connection.release();
};


exports.postLikedAlert= async function (userId,postId) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const postLikedAlertParams = [ postId, userId, userId ];

        const connection = await pool.getConnection(async (conn) => conn);

        const postLikedAlertResult = await postDao.postLikedAlert(connection, postLikedAlertParams);
        await connection.commit();
        connection.release();
        return postLikedAlertResult;



    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }


};



exports.postCommentLikedAlert= async function (userId,commentId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const postLikedAlertParams = [ commentId, userId, userId ];

      //  const connection = await pool.getConnection(async (conn) => conn);

        const commentLikedAlertResult = await postDao.commentLikedAlert(connection, postLikedAlertParams);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }


};
exports.replyLikedAlert= async function (userId,replyId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const postLikedAlertParams = [ replyId, userId, userId ];

       // const connection = await pool.getConnection(async (conn) => conn);

        const replyLikedAlertResult = await postDao.replyLikedAlert(connection, postLikedAlertParams);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }


};

