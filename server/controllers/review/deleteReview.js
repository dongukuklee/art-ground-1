const { comments: commentsModel } = require("../../models");
const { isAuthorized } = require("../../utils/tokenFunction");

const {
  removeFromSet,
  removeHash,
} = require("../../utils/redis/ctrl/setCache.ctrl");
module.exports.deleteReview = async (req, res) => {
  const userInfo = isAuthorized(req);

  const { postId: exhibition_id, commentId } = req.params;
  if (userInfo) {
    await removeFromSet(`exhibition:comment:${exhibition_id}`, commentId);
    await removeFromSet(`allExhibitionComment`, commentId);
    await removeHash(`comment:${commentId}`);
    await commentsModel.destroy({ where: { id: commentId } });
  } else {
    res.status(401).json({ message: "invalid user" });
  }
};
