const express = require('express');
const router = express.Router();
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy;

passport.use('kakao', new KakaoStrategy({
    clientID: 'faf8536f6684556c4a15623c70a54698',
    callbackURL: 'http://localhost:3000/auth/kakao/callback',     // 위에서 설정한 Redirect URI
}, async (accessToken, refreshToken, profile, done) => {
    //console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
}))


router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (res, req) => {
    res.redirect('/auth');
});

module.exports = router;