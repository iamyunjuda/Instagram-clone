const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const storyProvider = require("./storyProvider");
const storyDao = require("./storyDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");



//댓글 작성
//스토리 작성
exports.createStory = async function (userId,friendRange, photoURL , targetId,  content ) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const storyParams = [userId,friendRange ];
        const storyPicURL =[photoURL];
        const storyTaggedUser =[targetId];
        const alertParams =[userId, targetId,userId]
        const storyContent =[content];

        //const connection = await pool.getConnection(async (conn) => conn);

        const createStoryResult = await storyDao.createStory(connection, storyParams);
        const insertPhotoTosotryResult = await storyDao.insertPhotoForStoryResult(connection, storyPicURL);
        const insertTaggedUser = await storyDao.insertTaggedUser(connection, storyTaggedUser);
        if(targetId != ""){ await storyDao.storyTaggedAlert(connection,alertParams );
        }
        const insertContent= await storyDao.insertContent(connection, storyContent);
        await connection.commit();
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        connection.release();
        return errResponse(baseResponse.DB_ERROR);
    }


};


exports.storyCheck = async function (userId, storyId) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const checkParams = [storyId,userId];

        const storyCheckResult = await storyDao.createCheckUser(connection, checkParams)
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.getDmroom = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const getDmroomResult = await storyDao.getDmroom(connection, userId);
        await connection.commit();
        connection.release();

        return getDmroomResult[0];

    } catch (err) {
        await connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.getDm = async function (roomId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const getDmParams = [roomId];
      //  const connection = await pool.getConnection(async (conn) => conn);
        const getDmResult = await storyDao.getDm(connection, getDmParams);
        await connection.commit();
        connection.release();

        return getDmResult[0];

    } catch (err) {
        await connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.sendChat = async function (userId, content, roomId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const sendChatParams = [ content, userId,roomId];
        //const connection = await pool.getConnection(async (conn) => conn);
        const sendChatResult = await storyDao.sendChat(connection, sendChatParams);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
exports.getStroyRead = async function (userId, storyId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();
        const checkStoryParams = [userId, storyId];
        const params = [storyId];
        //console.log(check[0].count);
        //const connection = await pool.getConnection(async (conn) => conn);
        const check =  await storyDao.getCheck(connection, checkStoryParams);
       // console.log(check[0].count);
        if(check[0].ct> 0){
            console.log(check[0]);
            const getChatReadResult = await storyDao.getStoryRead(connection, params);
            await connection.commit();
            connection.release();
            return getChatReadResult[0];
        }
        else{
            return "STORY DOESN'T EXIST";

        }






    } catch (err) {
        await connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}