const story = require("./storyController");
const jwtMiddleware = require("../../../config/jwtMiddleware");

module.exports = function(app) {
    const story = require('./storyController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //23. 스토리 작성하기
    app.post('/app/story',jwtMiddleware,story.postStory);

    //24. 스토리 확인하기
    app.post('/app/story/check',jwtMiddleware,story.storyCheck);

    //25. DM방 목록 불러오기
    app.get('/app/:userId/dmroom',jwtMiddleware,story.getDmroom);

    //26. 채팅방 내용 불러오기
    app.get('/app/chat',jwtMiddleware,story.getChatList);
    //body값이 전달이 안되는데 이유를 모르겠음

    //27. 채팅 보내기
    app.post('/app/:userId/chat',jwtMiddleware,story.sendChat);

    //31.  스토리 읽은 사람 목록
    app.get('/app/story/read',jwtMiddleware,story.getStoryRead);


};