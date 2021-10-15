// 모든 유저 조회

async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT userEmail, userName 
                FROM User;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, userEmail) {
  const selectUserEmailQuery = `
                SELECT userEmail, userName
                FROM User
                WHERE userEmail = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, userEmail);
  return emailRows;
}


// 유저의 포스트 목록
async function selectUserPost(connection, userId){
  const selectUserPostQuery = `
    Select P.postId,
           P.userId,
           P.placeName,
           P.postContent,
        
        (select commentContent
         From Comments
         where commentId in (select max(commentId) from Comments where P.postId = Comments.postId)) as 'recent comment',
        DATE_FORMAT(P.createdAt, '%Y.%m.%d'),

        (select count(*) from Like_for_post where (P.postId) and P.status = 'ACTIVATED')       as 'numoflikes',

        (select likedUserId
         From Like_for_post
         where likeId in (select max(likeId)
                          from Like_for_post
                          where (P.postId))) as 'recent liked user'

    from (Post P )         
    where P.userId = ?;
                 `;
  const [userPostRow] = await connection.query(selectUserPostQuery, userId);

  return userPostRow;

}
//포스트에 포함된 사진 주소

async function selectPostInfo(connection, postId){
  const selectUserPostImageQuery = `
                 SELECT photoURL
                  FROM Post_Image
                  WHERE postId = ? 
                 `;
  const [userPostImageRow] = await connection.query(selectUserPostImageQuery, postId);
  //console.log(postId);
  return userPostImageRow;

}


// 유저 페이지 상단 정보
async function selectUserMainPage(connection, userId){
  const selectUserMainPageQuery = `
    select count(*)                        as 'Following',
        (select count(userId)  from Follower )  as 'Follower',
          (select count(postId) from Post where userId = F.userId)      as numberOfPost,
           (select userName from User  where userId = F.userId )  as  username,
           (select userIntro from User where userId = F.userId)  as userIntro,
           (select userPicUrl from User where userId = F.userId)as userProPic,
           (select userSubname from User where userId = F.userId)   as userSubname,
           (select website  from User where userId = F.userId)   as website,
           (select count(storyId)
            from Instastory
            where userId in (select userId from Instastory where savestory = 'Y') = userId) as validstory

    from (Following F
           inner join User U On U.userId = F.userId)

    where F.userID =?


  `;
  const [userMainPageRow] = await connection.query(selectUserMainPageQuery, userId);

  return userMainPageRow;

}



async function selectPostId(connection, userId){
  const selectPostIdQuery = `
                 select postId
                  From Post
                  where userId = ? 
                 `;
  const [postRow] = await connection.query(selectPostIdQuery, userId);
  //console.log(userId);
  return postRow;

}

//홈에서 내가 팔로우하는 사람들 스토리 목록 가져오기
async function selectMainPageStory(connection, userId){
  const selectPostIdQuery = `
    select storyId, friendRange,
           (select userName from User where userId in(I.userId)) as usreName,
           (select userPicUrl from User where userId in(I.userId)) as proPic,

           CASE
             WHEN TIMESTAMPDIFF(minute, createdAt, now()) < 60
               THEN concat(TIMESTAMPDIFF(minute, createdAt, now()), '분 전')
             WHEN TIMESTAMPDIFF(hour, createdAt, now()) < 24
               THEN concat(TIMESTAMPDIFF(hour, createdAt, now()), '시간 전')
             ELSE concat(FALSE)
             END AS storyExist

    from Instastory as I
    where userId in (select targetId from Following where userId = ?) and status ='ACTIVATED';



  `;
  const [storyRow] = await connection.query(selectPostIdQuery, userId);
  return storyRow;

}
//userId가 팔로우하는 사람들의 포스트 목록(메인 페이지 하단)
async function selectMainPagePost(connection, userId){
  const selectPostIdQuery = `
    select userId,
           postId,
           placeName,
           postContent,
           (select userName from User where userId = Post.userId)               as 'userName',
        (select userPicUrl from User where userId = Post.userId)             as 'userPic',
        (select count(storyId) from Instastory where Instastory.status ='ACTIVATED' and userID = Post.userId )   as 'storyExist',
        (select count(postId) from Like_for_post where postID = Post.postId) as 'numOfLikes',
        case
          when
              (select count(commentId) from Comments where postID = Post.postId) >= 1
            then concat('댓글 ', (select count(commentId) from Comments where postId = Post.postId), '개 모두 보기')
          when
              (select count(commentId) from Comments where postId = Post.postId) = 0
            then
              concat(' ')
          END                                                              as 'numOfComments'
    from Post
    where userId in (select targetId from Following where userId = ?) ORDER BY createdAt DESC;

  `;
  const [postRow] = await connection.query(selectPostIdQuery, userId);
  return postRow;

}

//사용자 알림의 목록
async function selectAlert(connection, userId){
  const selectAlertQuery = `
                        Select targetID,
                                    (select userName from User where userID in (Alert.userID)) as 'userName',
                                 (select userPicUrl from User where userId in(Alert.userID)) as 'userPic',
                                 content,
                                    case
                                      when
                                        TIMESTAMPDIFF(HOUR, createdAt, NOW()) <= 23
                                        then
                                        concat(TIMESTAMPDIFF(HOUR, createdAt, NOW()), ' 시간')
                                      when
                                        TIMESTAMPDIFF(DAY, createdAt, NOW()) <= 6
                                        then
                                        concat(TIMESTAMPDIFF(DAY, createdAt, NOW()), ' 일')
                                      else
                                        concat(TIMESTAMPDIFF(WEEK, createdAt, NOW()), ' 주')
                                      END as 'alertTime'

                             from Alert
                             where targetId = ? ORDER BY CreatedAt DESC;


  `;
  const [alertRow] = await connection.query(selectAlertQuery, userId);
  return alertRow;

}


// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT userId, userEmail, userName
                 FROM User
                 WHERE userId = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}
// userName 회원 조회
async function selectUserName(connection, userName){
  const selectUserNameQuery = `
                SELECT userId, userName
                FROM User
                WHERE userName LIKE ?;
                `;

  const [userNameRow] = await connection.query(selectUserNameQuery, userName);
  return userNameRow;



}
//유저 팔로잉 리스트 조회
async function selectFollowingList(connection, userId) {
  const selectUserIdQuery = `
    select
      targetId as userNameWhoIFollow,
      (select userName from User where userID in (F.targetId)) as userSubnameWhoIFollow,
      (select userPicUrl from User where userID in (F.targetId)) as 'userPic'
    from (Following F
           inner join User U on F.userID = U.userID)
    where F.userID=? and F.status='ACTIVATED';

  `;
  const [userFollowingRow] = await connection.query(selectUserIdQuery, userId);
  return userFollowingRow;
}

async function selectMyFollowingInfo(connection, userId) {
  const selectUserIdQuery = `
    
    select count(F.userId) as following,
           (select userName From User where userId= F.userId) as userName
    From (Following F
           inner join User U On U.userId= F.userId)
    where F.userId =? and F.status='ACTIVATED';



  `;
  const [userFollowingInfoRow] = await connection.query(selectUserIdQuery, userId);
  return userFollowingInfoRow;
}
//유저 팔로우 리스트 조회
async function selectFollowList(connection, userId) {
  const selectFollowListQuery = `

    select
      F.targetId as userNameWhoFollowMe,
      (select userName from User where userID in (F.targetId)) as userSubnameWhoFollowMe,
      (select userPicUrl from User where userID in (F.targetId)) as userPic
    from (Follower F
           inner join User U on F.userID = U.userID)
    where F.userID=1 and F.status='ACTIVATED';

  `;
  const [userFollowRow] = await connection.query(selectFollowListQuery, userId);
  return userFollowRow;
}

async function selectMyFollowInfo(connection, userId) {
  const selectFollowInfoQuery = `

    select count(F.targetId)                                   as follow,
           (select userName From User where userId = F.userId) as userName
    From (Follower F
           inner join User U On U.userId = F.userId)
    where F.userId = ? and F.status = 'ACTIVATED';



  `;
  const [userFollowInfoRow] = await connection.query(selectFollowInfoQuery, userId);
  return userFollowInfoRow;
}





// userName 회원 조회
async function selectUserName(connection, userName){
  const selectUserNameQuery = `
                SELECT userId, userName, userPicUrl
                FROM User
                WHERE userName Like ?;
                `;

  const [userNameRow] = await connection.query(selectUserNameQuery, userName);
  return userNameRow;



}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(userPhone, userEmail, password, userName)
        VALUES (?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT userEmail, userName, password
        FROM User 
        WHERE userEmail = ? AND password = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, userEmail) {
  const selectUserAccountQuery = `
        SELECT status, userId
        FROM User 
        WHERE userEmail = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      userEmail
  );
  return selectUserAccountRow[0];
}
// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserIdCheck(connection, userId) {
  const selectUserAccountQuery = `
    SELECT status, userId
    FROM User
    WHERE userId = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      userId
  );
  return selectUserAccountRow[0];
}

async function updateUserInfo(connection, userName, userId) {
  const updateUserQuery = `
  UPDATE User 
  SET userName = ?
  WHERE userId = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [userName, userId]);
  return updateUserRow[0];
}

async function checkPublic(connection, targetId) {

  const checkPublicQuery = `
    SELECT  isPublic From User where userId = ?
 `;
  const checkPublicRow = await connection.query(checkPublicQuery, targetId);
  console.log(checkPublicRow[0]);
  return checkPublicRow[0];
}

async function sendFollowing(connection, followingParams) {

  const checkPublicQuery = `
    INSERT INTO Following (userId,targetId,isAccepted) Values(?, ?, 'Y');
 `;
  const sendFollowingRow = await connection.query(checkPublicQuery, followingParams);
  return sendFollowingRow[0];
}

async function sendFollowingToPrivate(connection, followingParams) {

  const checkPublicQuery = `
    INSERT INTO Following (userId,targetId,isAccepted) Values(?, ?, 'N');
 `;
  const sendFollowingRow = await connection.query(checkPublicQuery, followingParams);
  return sendFollowingRow[0];
}


async function sendFollowAlert(connection, followAlertParams) {

  const sendFollowAlertQuery = `
    INSERT INTO Alert (targetId,content,userId)
    Values(?,concat((SELECT userName From User where userId =?),'님이 회원님을 팔로우 하셨습니다.'),?);

  `;
  const sendFollowAlertRow = await connection.query(sendFollowAlertQuery, followAlertParams);
  return sendFollowAlertRow[0];
}

async function sendFollowAlertToPrivate(connection, followAlertParams) {

  const sendFollowAlertQuery = `
    INSERT INTO Alert (targetId,content,userId)
    Values(?,concat((SELECT userName From User where userId =?),'님이 회원님을 팔로우를 요청하셨습니다.'),?);

  `;
  const sendFollowAlertRow = await connection.query(sendFollowAlertQuery, followAlertParams);
  return sendFollowAlertRow[0];
}

async function checkAlertExist(connection, alertId) {

  const checkAlertExistQuery = `
   SELECT status FROM Alert where alertId=?;
    

  `;
  const checkAlertExistRow = await connection.query(checkAlertExistQuery, alertId);
  console.log(checkAlertExistRow[0]);
  return checkAlertExistRow[0];
}

async function sendFollowingResponse(connection, alertId) {

  const checkAlertExistQuery = `
    UPDATE Alert SET status = 'INACTIVE' where alertId=?
    

  `;
  const checkAlertExistRow = await connection.query(checkAlertExistQuery, alertId);
  return checkAlertExistRow[0];
}
async function addFollow(connection, followParams) {

  const addFollowQuery = `
    INSERT INTO Follower (userId, targetId) VALUES ((SELECT userId from Alert where alertId=?),?);



  `;
  const addFollowRow = await connection.query(addFollowQuery, followParams);
  return addFollowRow[0];

}

async function addFollowing(connection, followParams) {

  const addFollowQuery = `
    UPDATE Following
    SET isAccepted = 'Y' where (targetId = (select targetId from Alert where alertId=?));



  `;
  const addFollowRow = await connection.query(addFollowQuery, followParams);
  return addFollowRow[0];
}

async function updateStoryExist(connection) {

  const addFollowQuery = `

    UPDATE Instastory SET status ='INACTIVE' where
      (TIMESTAMPDIFF(HOUR, createdAt, NOW()) > 23);


  `;
  const addFollowRow = await connection.query(addFollowQuery);
  return addFollowRow[0];
}
async function deleteUser(connection, userId) {

  const  deleteUserQuery = `
    UPDATE User SET status = 'INACTIVE' where userId=?;
  `;

  const deleteUserRow = await connection.query(
      deleteUserQuery,
      userId

  );

  return deleteUserRow;

}

async function changeStateToPublic(connection, userId) {

  const  deleteUserQuery = `
    UPDATE User SET isPublic = 'Y' where userId=?;
  `;

  const deleteUserRow = await connection.query(
      deleteUserQuery,
      userId

  );

  return deleteUserRow;

}
async function changeStateToPrivate(connection, userId) {

  const  deleteUserQuery = `
    UPDATE User SET isPublic = 'N' where userId=?;
  `;

  const deleteUserRow = await connection.query(
      deleteUserQuery,
      userId

  );

  return deleteUserRow;

}
async function checkState(connection, userId) {

  const  checkStateQuery = `
    SELECT isPublic From User where userId = ?;
  `;

  const checkStateQueryRow = await connection.query(
      checkStateQuery,
      userId

  );

  return checkStateQueryRow[0];

}
async function targetIdExist(connection, userId) {

  const  checkStateQuery = `
    SELECT count(targetId) From User where targetId = ?;
  `;

  const checkStateQueryRow = await connection.query(
      checkStateQuery,
      userId

  );

  return checkStateQueryRow[0];

}

async function userIdCheck(connection, userId) {

  const  checkStateQuery = `
    SELECT userId From User where userId = ?;
  `;

  const checkStateQueryRow = await connection.query(
      checkStateQuery,
      userId

  );

  return checkStateQueryRow;

}




module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  selectUserName,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserInfo,
  selectUserPost,
  selectPostInfo,
  selectPostId,
  selectUserMainPage,
  selectMainPageStory,
  selectMainPagePost,
  selectAlert,
  selectMyFollowingInfo,
  selectFollowingList,
  selectMyFollowInfo,
  selectFollowList,
  checkPublic,
  sendFollowing,
  sendFollowingToPrivate,
  sendFollowAlert,
  sendFollowAlertToPrivate,
  checkAlertExist,
  sendFollowingResponse,
  addFollow,
  addFollowing,
  updateStoryExist,
  deleteUser,
  changeStateToPrivate,
  changeStateToPublic,
  checkState,
  userIdCheck,
  selectUserIdCheck,
};