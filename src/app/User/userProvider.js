const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");
const {errResponse, response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");
//const postDao = require("./postDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUserNameList = async function (userName) {

  const connection = await pool.getConnection(async (conn) => conn);
  const userNameListResult = await userDao.selectUserName(connection, userName);
  connection.release();
  return userNameListResult;

};



exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};
//유저의 포스트글 목록 불러오기
exports.retrieveUserPost = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  await connection.commit();
  try {
    const userPostResult = await userDao.selectUserPost(connection, userId);
    const postIdList = await userDao.selectPostId(connection, userId);
    const newResult = new Object();
    let result=[];

  const hello={ };
    for (let i = 0; i < postIdList.length; i++) {
      const userPostImageList = await userDao.selectPostInfo(connection, postIdList[i].postId);
      //result.id ="photos";
      //result.content=

     const hello={
       "postImage" :    userPostImageList,
       "postContent" : userPostResult[i]

     }
     result.push(hello);
         // userPostImageList.push(userPostResult[i]);

     // result.push(userPostImageList);
      //json = JSON.stringify(obj, [userPostImageList, userPostImageList]);
      //result = JSON.stringify(result);
      //newResult[i] = userPostImageList;
     // newResult.push(userPostImageList);
    }



    connection.release();
    //return newResult;
    //return hello;
  return result;

  }catch(err){
    await connection.rollback();
    connection.release();
    return errResponse(baseResponse.DB_ERROR);

  }

};
//유저 메이지 상단 팔로워 ... 불로오기
exports.retrieveUserMainPage = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userMainPageResult = await userDao.selectUserMainPage(connection, userId);
  connection.release();
  return userMainPageResult;

};



//유저의 메인페이지 상단 가져오기(스토리 목록)
exports.retrieveMainPageStory = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  //await connection.commit();
  try {
    // 이메일 여부 확인
    await connection.beginTransaction();

    const userIdRows = await userDao.userIdCheck(connection,userId);
    if (userIdRows.length < 1) return errResponse(baseResponse.USER_USERID_NOT_EXIST);


    // 계정 상태 확인
    const userInfoRows = await userDao.selectUserIdCheck(connection, userId);
    if (userInfoRows[0].status === "INACTIVE") {
      return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
    } else if (userInfoRows[0].status === "DELETED") {
      return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
    }
    // DB의 userId
    const updateStoryExist= await userDao.updateStoryExist(connection);
    const mainPageStoryResult = await userDao.selectMainPageStory(connection, userId);
    await connection.commit();

    connection.release();
    return mainPageStoryResult;


    return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].userId});

  } catch (err) {

    await connection.rollback();
    connection.release();
    return errResponse(baseResponse.DB_ERROR);
  }
};

//유저의 메인페이지 하단 포스트 목록(내가 팔로우하는 사람들의 포스트 목록)
exports.retrieveMainPagePost = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const mainPagePostResult = await userDao.selectMainPagePost(connection, userId);
  connection.release();
  return mainPagePostResult;

};


// 사용자의 알림 목록을 가져와 주는
exports.retrieveAlertPage = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alertResult = await userDao.selectAlert(connection, userId);
  connection.release();
  //userPostImageList.merge(userPostResult);
  return alertResult;
  // return userPostImageList;
};


// 사용자의 팔로잉 목록을 가져와 주는
exports.retrieveFollowingPage = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    await connection.beginTransaction();
    const followingResult =[];
    const followingInfoResult = await userDao.selectMyFollowingInfo(connection, userId);
    followingResult.push(followingInfoResult);
    const followingListResult = await userDao.selectFollowingList(connection, userId);
    followingResult.push(followingListResult);
    await connection.commit();
    connection.release();
    return followingResult;}
  catch(err){
    await connection.rollback();
    return errResponse(baseResponse.DB_ERROR);

  }
};
// 사용자의 팔로우 목록을 가져와 주는
exports.retrieveFollowPage = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const followResult =[];
  const followInfoResult = await userDao.selectMyFollowInfo(connection, userId);
  followResult.push(followInfoResult);
  const followListResult = await userDao.selectFollowList(connection, userId);
  followResult.push(followListResult);
  connection.release();
  return followResult;
};






exports.emailCheck = async function (userEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, userEmail);
  connection.release();

  return emailCheckResult;
};

exports.userNameCheck = async function(userName){
  const connection = await pool.getConnection(async (conn) => conn);
  const userNameCheckResult = await userDao.selectUserName(connetion, userName);
  connection.release();

  return userNameCheckResult;

}

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.accountCheck = async function (userEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, userEmail);
  connection.release();

  return userAccountResult;
};