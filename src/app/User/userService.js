const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (userPhone, userEmail, password, userName) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        // 이메일 중복 확인
        await connection.beginTransaction();

        const userEmailRows = await userProvider.emailCheck(userEmail);
        if (userEmailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const insertUserInfoParams = [userPhone,userEmail, hashedPassword, userName];



        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)

        await connection.commit();

        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (userEmail, password) {

    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(userEmail);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].userEmail;

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");


        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(userEmail);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

      // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].userId,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].userId, 'jwt': token});

    } catch (err) {

        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (userId, userName) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {

        await connection.beginTransaction();

        const editUserResult = await userDao.updateUserInfo(connection, userName, userId)
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//팔로우 버튼 누르는
exports.retrieveFollowToTargetId = async function (userId, targetId) {
    const followingParams = [userId, targetId];
    const followAlertParams=[targetId,userId,userId]
    const connection = await pool.getConnection(async (conn) => conn);

    const targetIdExistResult = await userDao.targetIdExist(connection, targetId);

    const checkPublicResult = await userDao.checkPublic(connection, targetId);
    if(checkPublicResult==0){
        //존재하지 않는 유저를 팔로우 때문에 벨리데이션 처리해야함함

   }

    if(checkPublicResult=='Y'){
        //타깃이 공개 계정이면
        await connection.commit();
        const sendFollowingResult = await userDao.sendFollowing(connection, followingParams);
        const sendAlertResult = await userDao.sendFollowAlert(connection, followAlertParams);
        const addFollow = await userDao.addFollow(connection, followingParams);
        // const addFollowing = await userDao.addFollowing(connection, followingParams);
        connection.release();
        return;
    }
    else{

        const  sendFollowingToPrivate = await userDao.sendFollowingToPrivate(connection, followingParams);
        const sendAlertResult = await userDao.sendFollowAlertToPrivate(connection, followAlertParams);
        await connection.rollback();
        connection.release();

        return;

    }


};
// 팔로우를 받아주는 경우 -> private account만 해당
exports.retrieveFollowAlert = async function (userId, alertId) {

    const followAlertParams=[userId, alertId]
    const connection = await pool.getConnection(async (conn) => conn);
    const checkResult = await userDao.checkAlertExist(connection, alertId);
    //connection.release();--> 주석처리 10/8
    if(checkResult[0].status =='ACTIVATED'){
        //알림이 아직 확인 안함
        //const connection = await pool.getConnection(async (conn) => conn);
        await connection.beginTransaction();
        const addFollow = await userDao.addFollow(connection, followAlertParams);

        const addFollowing = await userDao.addFollowing(connection, alertId);

        const sendFollowingResponse = await userDao.sendFollowingResponse(connection, alertId);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);
    }
    else{
        await connection.rollback();
        connection.release();

        return response(baseResponse.SUCCESS);

    }


};

// 삭제하기
exports.deleteUser = async function (userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const checkResult = await userDao.deleteUser(connection, userId);
    connection.release();


};

// 삭제하기
exports.changeState = async function (userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const check = await userDao.checkState(connection,userId);

    if(check[0].isPublic == 'N'){
        console.log("ad");
        const checkResult = await userDao.changeStateToPublic(connection, userId);
    }
   else{

        const checkResult = await userDao.changeStateToPrivate(connection, userId);
    }
    connection.release();

   return  response(baseResponse.SUCCESS);

};