async function selectComment(connection, postId) {

  const selectCommentQuery = `

    select B.postId,
           B.userId,
           C.userName,
           C.userPicUrl,
           CASE
             WHEN TIMESTAMPDIFF(minute, B.createdAt, now()) < 60
               THEN concat(TIMESTAMPDIFF(minute, B.createdAt, now()), '분')
             WHEN TIMESTAMPDIFF(hour, B.createdAt, now()) < 24
               THEN concat(TIMESTAMPDIFF(hour, B.createdAt, now()), '시간')
             ELSE concat(TIMESTAMPDIFF(day, B.createdAt, now()), '일')
             END AS '작성시간',
        D.commentID as commentId, D.commentContent as 'comment',
        D.userId as 'commentUserName',
        (select count(commentID) from Like_for_comments where commentID = D.commentID) as 'comment likes',
        (select userPicUrl from User where userID = D.userID) as 'commentUserPic',
        CASE
          WHEN TIMESTAMPDIFF(minute, D.createdAt, now()) < 60
            THEN concat(TIMESTAMPDIFF(minute, D.createdAt, now()), '분')
          WHEN TIMESTAMPDIFF(hour, D.createdAt, now()) < 24
            THEN concat(TIMESTAMPDIFF(hour, D.createdAt, now()), '시간')
          ELSE concat(TIMESTAMPDIFF(day, D.createdAt, now()), '일')
          END AS 'comment written time'


    FROM ((Post B
      inner join User C on B.userID = C.userID)
           inner join Comments D on B.postID = D.postID)

    where B.postID = ?;
    `;
  const [commentRow] = await connection.query(selectCommentQuery, postId);

  return commentRow;

}

async function selectReplyComment(connection, postId) {
  const selectReplyCommentQuery = `
        Select C.commentID, R.content,R.numOfLikes  as numoflike,
               (Case
                    WHEN TIMESTAMPDIFF(minute, R.createdAt, now()) < 60
                        THEN concat(TIMESTAMPDIFF(minute, R.createdAt, now()), '분')
                    WHEN TIMESTAMPDIFF(hour, R.createdAt, now()) < 24
                        THEN concat(TIMESTAMPDIFF(hour, R.createdAt, now()), '시간')
                    ELSE concat(TIMESTAMPDIFF(day, R.createdAt, now()), '일')
                   END) as Time,
               (select userName From User where  R.userId = User.userId) as username,
                (select userPicUrl From User where  R.userId = User.userId) as userPicUrl

        from (Comments C
            inner join Reply R on C.commentID = R.commentID)

        where C.commentID = ?;




    `;
  const [replyCommentRow] = await connection.query(selectReplyCommentQuery, postId);
  //console.log(userId);
  return replyCommentRow;


}

//포스트 좋아요 누른 사용자 Id 조회
async function selectPostLikedUserId(connection, postLikedParams) {
  const selectUserIdQuery = `
        select likedUserId
        From Like_for_post
        where likedUserId=? and postId=?;
     `;
  const [userIdRows] = await connection.query(selectUserIdQuery,postLikedParams);
  return userIdRows;
}

async function insertUserLikedPost(connection, insertUserLikedPostParams) {
  const insertUserLikedPostQuery = `
        INSERT INTO Like_for_post(likedUserId, postId,userId)
        VALUES (?, ?,(select userId from Post where postId = ?));
    `;

  const insertUserLikedPostRow = await connection.query(
      insertUserLikedPostQuery,
      insertUserLikedPostParams
  );

  return insertUserLikedPostRow;
}

async function updateUserLikedPost(connection, updateUserLikedPostParams) {
  const updateUserLikedPostQuery = `
        UPDATE Like_for_post
        SET status =
                CASE
                    WHEN status ='ACTIVATED'
                        THEN 'UNACTIVATED'
                    When status ='UNACTIVATED'
                        then 'ACTIVATED'

                    END
        where likedUserId = ? and postId= ?;


    `;

  const updateUserLikedPostRow = await connection.query(
      updateUserLikedPostQuery,
      updateUserLikedPostParams
  );

  return updateUserLikedPostRow;
}


//댓글 좋아요 누른 사람들 조회

async function selectCommentLikedUserId(connection, commentLikedParams) {
  const selectUserIdQuery = `
        select likedId
        From Like_for_comments
        where likedId=? and commentId=?;
     `;
  const [userIdRows] = await connection.query(selectUserIdQuery,commentLikedParams);
  return userIdRows;
}


// 댓글 업데이트 누른 사람 좋아요/좋아요 취소
async function updateUserLikedComment(connection, updateUserLikedCommentParams) {
  const updateUserLikedCommentQuery = `
        UPDATE Like_for_comments
        SET status =
                CASE
                    WHEN status ='ACTIVATED'
                        THEN 'UNACTIVATED'
                    When status ='UNACTIVATED'
                        then 'ACTIVATED'

                    END
        where likedId = ? and commentId= ?;

    `;

  const updateUserLikedCommentRow = await connection.query(
      updateUserLikedCommentQuery,
      updateUserLikedCommentParams
  );

  return updateUserLikedCommentRow;
}

async function insertUserLikedComment(connection, insertUserLikedCommentParams) {
  const insertUserLikedCommentQuery = `
        INSERT INTO Like_for_comments(likedId, commentId,userId)
        VALUES (?, ?, (select userId from Comments where commentId =? ));



    `;

  const insertUserLikedPostRow = await connection.query(
      insertUserLikedCommentQuery,
      insertUserLikedCommentParams
  );

  return insertUserLikedPostRow;
}

async function updatePostLikedNumber(connection, updateUserLikedNumberParams) {
  const updateNumOfUserLikedPostQuery = `
        UPDATE Post SET
            numberOfLikes = (
                SELECT count(likeid) FROM Like_for_post
                WHERE postId = ? and status = 'ACTIVATED'

            )

        where postId =?;
    `;

  const updateNumOfUserLikedPostRow = await connection.query(
      updateNumOfUserLikedPostQuery,
      updateUserLikedNumberParams
  );

  return updateNumOfUserLikedPostRow;

}
async function updateCommentLikedNumber(connection, updateUserCommentLikedNumberParams) {
  const updateNumOfUserLikedCommentQuery = `
        UPDATE Comments SET
            numOfLikes = (
                SELECT count(likeid) FROM Like_for_comments
                WHERE commentId = ? and status = 'ACTIVATED'

            )

        where commentId =?;
    `;

  const updateNumOfUserLikedCommentRow = await connection.query(
      updateNumOfUserLikedCommentQuery,
      updateUserCommentLikedNumberParams
  );

  return updateNumOfUserLikedCommentRow;

}

//대댓글 좋아요 누른 사람 아이디
async function selectReplyLikedUserId(connection, replyLikedParams) {
  const selectUserIdQuery = `
        select likedUserId
        From Like_for_replies
        where likedUserId=? and replyId=?
     `;
  const [replyIdRows] = await connection.query(selectUserIdQuery,replyLikedParams);
  return replyIdRows;
}


async function updateUserLikedReply(connection, updateUserReplyLikedNumberParams) {
  const updateNumOfUserLikedReplyQuery = `
        UPDATE Like_for_replies
        SET status =
                CASE
                    WHEN status ='ACTIVATED'
                        THEN 'UNACTIVATED'
                    When status ='UNACTIVATED'
                        then 'ACTIVATED'

                    END
        where likedUserId = ? and replyId= ?;
    `;

  const updateNumOfUserLikedReplyRow = await connection.query(
      updateNumOfUserLikedReplyQuery,
      updateUserReplyLikedNumberParams
  );

  return updateNumOfUserLikedReplyRow;

}

async function insertUserLikedReply(connection, insertUserLikedReplyParams) {
  const insertUserLikedReplyQuery = `
        INSERT INTO Like_for_replies(likedUserId, replyId,userId)
        VALUES (?, ?, (select userId from Reply where replyId =? ));


    `;

  const insertUserLikedCommentRow = await connection.query(
      insertUserLikedReplyQuery,
      insertUserLikedReplyParams
  );

  return insertUserLikedCommentRow;
}

async function updateReplyLikedNumber(connection, updateUserCommentLikedNumberParams) {
  const updateNumOfUserLikedCommentQuery = `
        UPDATE Reply SET
            numOfLikes = (
                SELECT count(likeid) FROM Like_for_replies
                WHERE replyId = ? and status = 'ACTIVATED'

            )

        where replyId =?;
    `;

  const updateNumOfUserLikedReplyRow = await connection.query(
      updateNumOfUserLikedCommentQuery,
      updateUserCommentLikedNumberParams
  );

  return updateNumOfUserLikedReplyRow;

}
//글 생성

async function insertPost(connection, insertPostParams) {
  const insertPostQuery = `
        INSERT INTO Post(userId, placeName, postContent)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
      insertPostQuery,
      insertPostParams
  );

  return insertUserInfoRow;
}
//v포스트 내용 수정
async function updatePost(connection, updatePostParams) {
  const updatePostQuery = `
        UPDATE Post
        SET postContent = ?, placeName= ?
        where postid = ?;
    `;
  const updatePostRow = await connection.query(
      updatePostQuery,
      updatePostParams
  );

  return updatePostRow;
}
/*
async function updatePostPlaceName(connection, updatePostParams) {
    const updatePostPlaceQuery = `
        UPDATE Post
        SET placeName = ?
        where postid = ?;
    `;
    const updatePostRow = await connection.query(
        updatePostPlaceQuery,
        updatePostParams
    );

    return updatePostRow;
}*/

async function updateComment(connection, updateCommentParams) {
  const updateCommentQuery = `
        UPDATE Comments
        SET commentContent = ?
        where userId = ? and commentId = ?;
    `;
  const updateCommentRow = await connection.query(
      updateCommentQuery,
      updateCommentParams
  );

  return updateCommentRow;
}

async function updateReply(connection, updateReplyParams) {
  const updateReplyQuery = `
        UPDATE Reply
        SET content =?
        where userId=?  and replyId =?;
    `;
  const updateReplyRow = await connection.query(
      updateReplyQuery,
      updateReplyParams
  );

  return updateReplyRow;
}
async function createComment(connection, createCommentParams) {
  const createCommentQuery = `
       INSERT INTO Comments(userId, postId,commentContent)
            VALUES(?,?,?);
      
    `;
  const createCommentRow = await connection.query(
      createCommentQuery,
      createCommentParams
  );

  return createCommentRow;

}

async function createReply(connection, createReplyParams) {
  const createReplyQuery = `
        INSERT INTO Reply(userId, commentId, content)
        VALUES(?,?,?);
    `;
  const createReplyRow = await connection.query(
      createReplyQuery,
      createReplyParams
  );

  return createReplyRow;

}

async function updateNumOfComment(connection, updateNumOfCommentParams) {
  const updateNumOfCommentQuery = `
        UPDATE  Post
        SET numberOfComments = (
            SELECT count(commentId) From Comments
            WHERE postId=? and status ='ACTIVATED')
        where postId =?;

    `;
  const updateNumOfCommentRow = await connection.query(
      updateNumOfCommentQuery,
      updateNumOfCommentParams
  );

  return updateNumOfCommentRow;

}
async function updateNumOfReply(connection, updateNumOfReplyParams) {

  const updateNumOfReplyQuery = `
        UPDATE  Post
        SET numberOfComments = (
                (select count(commentId) from Comments where PostId =
                                                             (SELECT postId From Comments
                                                              WHERE commentId = ? ) and status = 'ACTIVATED') +  1 )
        where (postId = ( SELECT postId From Comments
                          WHERE commentId = ?));



    `;

  const updateNumOfReplyRow = await connection.query(
      updateNumOfReplyQuery,
      updateNumOfReplyParams

  );

  return updateNumOfReplyRow;

}


async function postLikedAlert(connection, postLikedAlertParams) {

  const postLikedAlertQuery = `
        INSERT INTO Alert (targetId, userId,content) VALUES (
             (select userId from Post where postId=?),?,
      concat((SELECT userName From User where userId=?),'님이 회원님의 게시물을 좋아합니다.'))


    `;

  const postLikedAlertRow = await connection.query(
      postLikedAlertQuery,
      postLikedAlertParams

  );

  return postLikedAlertRow;

}

async function checkSendAlert(connection, checkSendAlertParams) {

  const checkSendAlertQuery = `
        select status from Like_for_post
        where likeduserId = ? and postId=? and status='ACTIVATED';


    `;

  const checkSendAlertRow = await connection.query(
      checkSendAlertQuery,
      checkSendAlertParams

  );

  return checkSendAlertRow[0];

}

module.exports = {
  selectComment,
  selectReplyComment,
  selectPostLikedUserId,
  insertUserLikedPost,
  updateUserLikedPost,
  selectCommentLikedUserId,
  updateUserLikedComment,
  insertUserLikedComment,
  updatePostLikedNumber,
  updateCommentLikedNumber,
  selectReplyLikedUserId,
  updateUserLikedReply,
  insertUserLikedReply,
  updateReplyLikedNumber,
  insertPost,
  updatePost,
  //  updatePostPlaceName,
  updateComment,
  updateReply,
  createComment,
  createReply,
  updateNumOfComment,
  updateNumOfReply,
  postLikedAlert,
  checkSendAlert,

};