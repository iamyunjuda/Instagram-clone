async function createStory(connection, storyParams) {
  //userId, friendRange
  const createStoryQuery = `
    INSERT INTO Instastory (userId, friendRange) VALUES (?,?);
     
    `;
  const [createStoryresultRow] = await connection.query(createStoryQuery, storyParams);
  //console.log(userId);
  return createStoryresultRow;

}

async function insertPhotoForStoryResult(connection, storyPicParams) {
  //userId, friendRange
  const createStoryQuery = `
    INSERT INTO Instastory_photos (storyId, photoURL) VALUES ((SELECT MAX(storyId) From Instastory),?);
     
    `;
  const [insertPhotoForStoryResultRow] = await connection.query(createStoryQuery, storyPicParams);
  //console.log(userId);
  return insertPhotoForStoryResultRow;

}
async function insertTaggedUser(connection, targetId) {
  //userId, friendRange
  const createStoryQuery = `
    INSERT INTO Instastory_tagged_user (userId, storyId) VALUES (?,(SELECT MAX(storyId) From Instastory));

  `;
  const [insertTaggedUserresultRow] = await connection.query(createStoryQuery, targetId);
  //console.log(userId);
  return insertTaggedUserresultRow;

}
async function insertContent(connection, content) {
  //userId, friendRange
  const insertContentQuery = `
    INSERT INTO Instastory_text (storyId,content) VALUES ((SELECT MAX(storyId) From Instastory),?);

  `;
  const [insertContentresultRow] = await connection.query(insertContentQuery, content);
  //console.log(userId);
  return insertContentresultRow;

}
async function storyTaggedAlert(connection, postLikedAlertParams) {

  const storyTaggedAlertQuery = `
        INSERT INTO Alert (targetId, userId,content) VALUES (
             (?,?,
      concat((SELECT userName From User where userId=?),'님이 회원님을 스토리에 태그하셨습니다.'))


    `;

  const storyTaggedAlertRow = await connection.query(
      storyTaggedAlertQuery,
      postLikedAlertParams

  );

  return storyTaggedAlertRow;

}
async function createCheckUser(connection, checkParams) {

  const createCheckUserQuery = `
        INSERT INTO Instastory_viewed (storyId, userId) VALUES (?,?);
             
     


    `;

  const createCheckUserRow = await connection.query(
      createCheckUserQuery,
      checkParams

  );

  return createCheckUserRow;

}

async function getDmroom(connection, userId) {

  const getDmroomQuery = `
    select J.roomID,
           U.userName                                                                              as 'roomName',
        (select userPicUrl from User where userID in (J.targetID)) as 'proPic',
        (select message
         from DM_Message
         where messageID in (select max(messageID) from DM_Message where roomID in (J.roomID))) as 'Current Message',

        CASE
          WHEN TIMESTAMPDIFF(minute, M.createdAt, now()) < 60
            THEN concat(TIMESTAMPDIFF(minute, M.createdAt, now()), '분')
          WHEN TIMESTAMPDIFF(hour, M.createdAt, now()) < 24
            THEN concat(TIMESTAMPDIFF(hour, M.createdAt, now()), '시간')
          ELSE concat(TIMESTAMPDIFF(day, M.createdAt, now()), '일')
          END                                                                                 AS 'time'
    from ((DMRoom J
      inner join User U on U.userID = J.userID)
           inner join DM_Message M on M.userID = J.userID)
    where J.userID = ?;
        
    `;

  const getDmroomrRow = await connection.query(
      getDmroomQuery,
      userId

  );

  return getDmroomrRow;

}
async function getDm(connection, dmParams) {

  const getDmQuery = `
    select message, userID,
           (select userPicUrl from User where userId in (DM_Message.userID)) as 'proPic',
        (select date_format(DM_Message.createdAt,'%Y년%c월%e일'))
    from DM_Message
    where roomID = ?
    order by createdAt DESC;

  `;

  const getDmRow = await connection.query(
      getDmQuery,
      dmParams

  );

  return getDmRow;

}


async function sendChat(connection, chatParams) {
//userId, content, roomId
  const sendChatQuery = `
    INSERT INTO  DM_Message (message, userId, roomId) Values (?,?,?);
  `;

  const getChatRow = await connection.query(
      sendChatQuery,
      chatParams

  );

  return getChatRow;

}

async function getStoryRead(connection, storyParams) {
// storyId
  const sendQuery = `
    select userId, userName, userPicUrl, userIntro From User where (userId =
    (select viewedId From Instastory_viewed where storyId=?));
  `;

  const getChatRow = await connection.query(
      sendQuery,
      storyParams

  );

  return getChatRow;

}
async function getCheck(connection, storyParams) {
// userId, storyId
  const sendQuery = `
    SELECT count(storyId) as ct From Instastory where userId = ? and storyId=?;
  `;

  const getChatRow = await connection.query(
      sendQuery,
      storyParams

  );

  return getChatRow[0];

}

module.exports = {
  createStory,
  insertPhotoForStoryResult,
  insertTaggedUser,
  storyTaggedAlert,
  insertContent,
  createCheckUser,
  getDmroom,
  getDm,
  sendChat,
  getStoryRead,
  getCheck,

};