const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");


const postDao = require("./postDao");
const {errResponse} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");


exports.retrieveCommentPage  = async function (postId) {

  const connection = await pool.getConnection(async (conn) => conn);
  try{
  await connection.beginTransaction();

  const commentResult = await postDao.selectComment(connection, postId);
  const sqlResults = [];

  for (let i = 0; i < commentResult.length; i++) {
    sqlResults.push(commentResult[i]);
    const replyComment = await postDao.selectReplyComment(connection, commentResult[i].commentId);
    sqlResults.push(replyComment);
  }
    await connection.commit();
  connection.release();
  return sqlResults;
}
    catch(err){
      await connection.rollback();
     connection.release();
     return errResponse(baseResponse.DB_ERROR);
    }



};

exports.postLikedCheck  = async function (postLikedParams) {

  const connection = await pool.getConnection(async (conn) => conn);
  const userIdCheckResult = await postDao.selectPostLikedUserId(connection, postLikedParams);

  connection.release();



  return userIdCheckResult;
};

exports.commentLikedCheck  = async function (commentLikedParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const commentLikedCheckResult = await postDao.selectCommentLikedUserId(connection, commentLikedParams);

  connection.release();



  return commentLikedCheckResult;
};

exports.replyLikedCheck = async function (replyLikedParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const replyLikedCheckResult = await postDao.selectReplyLikedUserId(connection, replyLikedParams);

  connection.release();



  return replyLikedCheckResult;
};

exports.checkSendAlert = async function (userId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkParams = [userId,postId];
  const replyLikedCheckResult = await postDao.checkSendAlert(connection, checkParams);

  connection.release();



  return replyLikedCheckResult;
};




