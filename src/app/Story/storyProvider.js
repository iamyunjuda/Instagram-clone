const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");


const postDao = require("./storyDao");

//const userDao = require("./userDao");

exports.retrieveCommentPage  = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const commentResult = await postDao.selectComment(connection, postId);
  const sqlResults= [];
  for (let i =0;i<commentResult.length;i++){
    sqlResults.push(commentResult[i]);
    const replyComment = await postDao.selectReplyComment(connection, commentResult[i].commentId);

    sqlResults.push(replyComment);

    console.log(sqlResults[i]);

  }

  connection.release();

  return sqlResults;
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





