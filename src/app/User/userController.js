const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
//exports.getTest = async function (req, res) {
 //return res.send(response(baseResponse.SUCCESS))
//}

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users/new_user
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: userPhone, userEmail, password, userName, isPublic
     * 전화번호 이메일 비밀번호
     */

    const { userPhone, userEmail, password, userName, isPublic } = req.body;
    //빈 값 체크
    //길이 체크 인스타그램에서는 안 함

    // 빈 값 체크
    if (!userEmail)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 길이 체크
    if (userEmail.length > 30)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));
    //비번 빈 값 체크
    if (!password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    //비번 길이 체크(너무 길지 않도록)
    if (password.length > 30)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));
    if (!userName)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    if (userName.length>15)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));
    if (!isPublic)
        return res.send(response(baseResponse.SIGNUP_ISPUBLIC_EMPTY));

    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(userEmail))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    // 기타 등등 - 추가하기


    const signUpResponse = await userService.createUser(
        userPhone,
        userEmail,
        password,
        userName,
        isPublic
    );

    return res.send(signUpResponse);
};


/**
 * API No. 2
 * API Name : 특정 유저 조회 API  userName 으로 검색
 * [GET] /app/users/{userName}
 */
exports.getUsersName = async function (req, res) {
    /**
     * Path variable: userName
     */

    const {userName} = req.body;

    if (!userName) {
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else {
        // 유저 검색 조회
        const userListByUserName = await userProvider.retrieveUserNameList(userName+'%');
        return res.send(response(baseResponse.SUCCESS, userListByUserName));
    }
};


/**
 * API No. 3
 * API Name : 특정 유저의 포스트 조회 API
 * [GET] '/app/user-pages/posts/:userId'
 *
 */

exports.getUserPost = async function (req, res) {
    /**
     * // jwt - userId, Path Variable: userId
     */

    // 빈 값 체크

    const userIdFromJWT = req.verifiedToken.userId;
    const userId = req.params.userId;
    if (!userId) {
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    }


    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }

    else{
        const userPostByUserId = await userProvider.retrieveUserPost(userId);
        return res.send(response(baseResponse.SUCCESS, userPostByUserId));
    }
};

/**
 * API No. 4
 * API Name : 특정 유저 메인페이지 상단 조회 API(팔로우, 팔로워 숫자 + 프사 등등)
 *
 * [GET] /app/:userId
 *
 */
exports.getUserMainPage = async function (req, res) {
    /**
     *  jwt - userId, Path Variable: userId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    if(!userId){
        res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    }
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{
        const userPostByUserId = await userProvider.retrieveUserMainPage(userId);
        return res.send(response(baseResponse.SUCCESS, userPostByUserId));
    }

};

/**
 * API No. 5
 * API Name : 로그인한 사용자  home 상단 스토리 목록 조회
 *
 * [GET] /app/:userId/story
 *
 */
exports.getMainPageStory = async function (req, res) {
    /**
     * Path Variable: userId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{
        const mainPageStoryByUserId = await userProvider.retrieveMainPageStory(userId);
        return res.send(response(baseResponse.SUCCESS, mainPageStoryByUserId));
    }

};

/**
 * API No. 6
 * API Name : 로그인한 사용자  home 하단 포스트 목록 조회
 *
 * [GET]/app/:userId/home
 *
 */
exports.getMainPagePost = async function (req, res) {
    /**
     * Path Variable: userId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const getMainPagePost = await userProvider.retrieveMainPagePost(userId);
        return res.send(response(baseResponse.SUCCESS, getMainPagePost));
    }
};


/**
 * API No. 7
 * API Name : 로그인한 사용자  알림 페이지 내용 불러오기
 *
 * [GET]/app/:userId/alerts
 *
 */
exports.getAlertPage= async function (req, res) {
    /**
     * Path Variable: userId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }

    else{

        const getAlertPage = await userProvider.retrieveAlertPage(userId);
        return res.send(response(baseResponse.SUCCESS, getAlertPage));
    }
};

/**
 * API No. 9
 * API Name : 특정 유저 팔로잉 조회 API
 * [GET] /app/users/:userId/followings
 *
 */

exports.getFollowingPage= async function (req, res) {
    /**
     * Path Variable: userId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const getFollowingPage = await userProvider.retrieveFollowingPage(userId);
        return res.send(response(baseResponse.SUCCESS, getFollowingPage));
    }
};

/**
 * API No. 10
 * API Name : 특정 유저 팔로우 조회 API
 * [GET] /app/users/follow/{userId}
 *
 */


exports.getFollowPage= async function (req, res) {
    /**
     * Path Variable: userId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{

        const getFollowPage = await userProvider.retrieveFollowPage(userId);
        return res.send(response(baseResponse.SUCCESS, getFollowPage));
    }
};


/**
 * API No. 21
 * API Name : 내가 상대방을 follow하는 API (내가 follow 뉴룸)
 * [Post] /app/users/:userId/follows
 *
 */


exports.postFollow= async function (req, res) {
    /**
     * Path Variable: userId , targetId
     */
    const userIdFromJWT = req.verifiedToken.userId;
    const userId = req.params.userId;

    const {targetId}= req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!targetId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));



    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    else{


        const sendFollowToTargetId = await userService.retrieveFollowToTargetId(userId,targetId);
        return res.send(response(baseResponse.SUCCESS, sendFollowToTargetId));
    }
};
/**
 * API No. 21
 * API Name : follow 수락 API
 * [Post] /app/users/:userId/follows
 *
 */


exports.postFollower= async function (req, res) {
    /**
     * Path Variable: userId
     * Body : alertId
     */
    const userIdFromJWT = req.verifiedToken.userId
    const userId = req.params.userId;
    const {alertId} = req.body;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!alertId) return res.send(errResponse(baseResponse.USER_ALERTID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }




    else {
        const acceptFollow = await userService.retrieveFollowAlert(userId,alertId);
        return res.send(response(baseResponse.SUCCESS, acceptFollow));
    }
};






/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userId}
 * 2021/10/01 오후2시 : 유저 조회시 입력된 문자로 시작하는 유저 전체 검색하게 바꿔주어야함
 */
exports.getUserById = async function (req, res) {

    /**
     * Path Variable: userId
     */
    console.log("get userID is called!");
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userByUserId = await userProvider.retrieveUser(userId);
    return res.send(response(baseResponse.SUCCESS, userByUserId));
};


// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : userEmail, password
 */
exports.login = async function (req, res) {

    const {userEmail, password} = req.body;
    console.log("hello");
    // TODO: email, password 형식적 Validation
    // 빈 값 체크
    if (!userEmail)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));
    if(!password){
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));

    }
    //비번 길이 체크하기!

    const signInResponse = await userService.postSignIn(userEmail, password);

    return res.send(signInResponse);
};

// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : userEmail, password
 */
exports.kakaologin = async function (req, res) {

    const {userEmail, password} = req.body;
    console.log("hello");
    // TODO: email, password 형식적 Validation
    // 빈 값 체크
    if (!userEmail)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));
    if(!password){
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));

    }
    //비번 길이 체크하기!

    const signInResponse = await userService.postSignIn(userEmail, password);

    return res.send(signInResponse);
};







/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userId
 * path variable : userId
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    const {userName} = req.body;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (!userName) return res.send(errResponse(baseResponse.USER_USERNAME_EMPTY));

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!userName) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

        const editUserInfo = await userService.editUser(userId, userName)
        return res.send(editUserInfo);
    }
};


/**
 * API No. 29
 * API Name : 회원 삭제
 * [PATCH] /app/:userId/delete
 * path variable : userId

 */
exports.deleteUsers = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {


        const deleteUserInfo = await userService.deleteUser(userId)
        return res.send(deleteUserInfo);
    }
};

/**
 * API No. 30
 * API Name : 상태변경
 * [PATCH] /app/:userId/state
 * path variable : userId

 */
exports.changeState = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        const changeStateInfo = await userService.changeState(userId)
        return res.send(changeStateInfo);
    }
};




/**
 * API No. 3
 * API Name : 특정 유저의 포스트 조회 API
 * [GET] '/app/user-pages/posts/:userId'
 *
 */

exports.userget = async function (req, res) {
    /**
     * // jwt - userId, Path Variable: userId
     */

        // 빈 값 체크

    const userIdFromJWT = req.verifiedToken.userId;
    const userId = req.params.userId;
    if (!userId) {
        return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    }

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }

    else{
        const userPostByUserId = await userProvider.retrieveUserPost(userId);
        return res.send(response(baseResponse.SUCCESS, userPostByUserId));
    }
};





/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};