const jwtMiddleware = require("../../../config/jwtMiddleware");
const storyProvider = require("../../app/Story/storyProvider");
const storyService = require("../../app/Story/storyService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");


/**
 * API No. 23
 * API Name : 스토리 작성하기
 *
 * [POST] /app/story
 *
 */
exports.postStory= async function (req, res) {
    /**
     * Path Variable: {userId,friendRange, photoURL , userId(targetId),  content}
     */

    const {userId,friendRange, photoURL , targetId,  content} = req.body;
    const userIdFromJWT = req.verifiedToken.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const createStoryResponse = await storyService.createStory(
            userId,friendRange, photoURL , targetId,  content

        );
        return res.send(createStoryResponse);
    }


};


/**
 * API No. 24
 * API Name : 스토리 확인하기
 *
 * [POST] /app/story/check
 *
 */
exports.storyCheck= async function (req, res) {
    /**
     * Path Variable: {userId, storyId}
     */

    const {userId, storyId} = req.body;
    const userIdFromJWT = req.verifiedToken.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!userId) return res.send(errResponse(baseResponse.STORY_STORYID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const checkStoryResponse = await storyService.storyCheck(
            userId, storyId

        );
        return res.send(checkStoryResponse);
    }


};


/**
 * API No. 25
 * API Name : 대화목록 불러오기
 *
 * [GET] /app/dmroom
 *
 */
exports.getDmroom= async function (req, res) {
    /**
     * Path Variable: {userId}
     */

    const userId = req.params.userId;

    const userIdFromJWT = req.verifiedToken.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const getDmRoomResponse = await storyService.getDmroom(
            userId)

        return res.send(getDmRoomResponse);
    }
};
/**
 * API No. 26
 * API Name : 채팅 내용
 *
 * [GET] /app/chat
 *
 */


exports.getChatList= async function (req, res) {
    /**
     *
     * Body : {userId, roomId}
     *
     */

    const {userId, roomId} = req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!roomId) return res.send(errResponse(baseResponse.CHAT_ROOMID_EMPTY));
    const userIdFromJWT = req.verifiedToken.userId;


    if (userIdFromJWT != userId) {
            res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

            const getDmResponse = await storyService.getDm(
                roomId
            );
            return res.send(getDmResponse);
    }

};

/**
 * API No. 27
 * API Name : 채팅전송
 *
 * [GET] /app/:userId/chat
 *
 */

exports.sendChat= async function (req, res) {
    /**
     * Path Variable:userId
     * Body : targetId, Content, roomId
     */
    const userId =req.params.userId;
    const {content, roomId} = req.body;
    const userIdFromJWT = req.verifiedToken.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!roomId) return res.send(errResponse(baseResponse.CHAT_ROOMID_EMPTY));
    if (!content) return res.send(errResponse(baseResponse.POST_CONTENT_EMPTY));

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const sendChatResponse = await storyService.sendChat(
           userId, content, roomId
        );
        return res.send(sendChatResponse);
    }

};

/**
 * API No. 31
 * API Name : 스토리 읽은 사람 목록
 *
 * [GET] /app/story/read
 *
 */

exports.getStoryRead= async function (req, res) {
    /**
     *
     * Body : userId, storyid
     */

    const {userId, storyId} = req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!storyId) return res.send(errResponse(baseResponse.STORY_STORYID_EMPTY));
    const userIdFromJWT = req.verifiedToken.userId;
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const getStoryReadResponse = await storyService.getStroyRead(
             userId, storyId
        );
        return res.send(getStoryReadResponse);
    }

};







