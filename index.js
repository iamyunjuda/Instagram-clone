const express = require('./config/express');
const {logger} = require('./config/winston');


//<a href="https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=faf8536f6684556c4a15623c70a54698&redirect_uri=http://localhost:3000/auth/kakao/callback" className={style.kakao}>카카오 로그인</a>
const port = 3000;
express().listen(port);
