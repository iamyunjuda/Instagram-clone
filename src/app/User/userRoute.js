const user = require("./userController");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const passport = require("passport");

module.exports = function(app){
    const user = require('./userController');
    const middleWare = require('../../../config/middleWare');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


// 사용자 구현 부분

    // TODO: After 로그인 인증 방법 (JWT)
    // 로그인 하기 API (JWT 생성)
    app.post('/app/login',user.login);

    const passport = require('passport');
    const KakaoStrategy = require('passport-kakao').Strategy;
    app.use(passport.initialize());
    passport.use('kakao',
        new KakaoStrategy({ clientID: 'faf8536f6684556c4a15623c70a54698', callbackURL: 'http://localhost:3000/auth/kakao/callback', }
            , async (accessToken, refreshToken, profile, done)=> { console.log(accessToken); console.log(profile); }));




    app.get('/kakao', passport.authenticate('kakao'));
    app.get('/auth/kakao/callback',
       passport.authenticate('kakao', { failureRedirect: '/', })
          , (req, res) => { res.redirect('/'); });


    // 0. 테스트 API
     //app.get('/app/test', user.getTest)

    // 1. 유저 생성 (회원가입) API

    app.post('/app/users', user.postUsers);

    // 2. 유저 조회 API (+ 검색)
    app.get('/app/search',user.getUsersName);

    // 3. 특정 유저 조회 API
    //app.get('/app/users/users/:userId', user.getUserById);

    //  3. 내 포스트 목록
    app.get('/app/:userId/posts',jwtMiddleware,user.getUserPost);

    //  4. 내 메인페이지 상단 (프로필사진, 닉네임, 한줄소개, 팔로우, 팔로워 수 가져오기)
    app.get('/app/:userId', jwtMiddleware,user.getUserMainPage);

    //  5. 홈의 상단 스토리 목록 불러오기
    app.get('/app/:userId/stories',jwtMiddleware, user.getMainPageStory);

    //  6. 홈의 하단 포스트 목록 불러오기 --> 구체적인 알림의 내용을 불러오는 것은 아직 처리하지 못함
    app.get('/app/:userId/home',jwtMiddleware,user.getMainPagePost);

    //  7. 유저의 알림 화면 불러오기
    app.get('/app/:userId/alerts',jwtMiddleware, user.getAlertPage);

    // 9. 유저의 팔로잉 목록 가져오기
    app.get('/app/users/:userId/followings',jwtMiddleware, user.getFollowingPage);

    // 10. 유저의 팔로우 목록 가져오기
    app.get('/app/users/:userId/follows', jwtMiddleware,user.getFollowPage);

    //21. 내가 상대를 팔로우 누르기
    app.post('/app/:userId/following',jwtMiddleware, user.postFollow);

    //22. 팔로우 요청 수락하기
  app.post('/app/:userId/add',jwtMiddleware, user.postFollower);

    //28. 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용) == 누군가가 로그인을 해야만 이용가능
    app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers);

    //29. 회원 삭제
    app.patch('/app/:userId/delete', jwtMiddleware, user.deleteUsers);

    //30. 계정 공개/비공계
    app.patch('/app/:userId/state',jwtMiddleware,user.changeState);

};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
//app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API