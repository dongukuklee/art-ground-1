const { getTotalExhibitionData } = require("../../utils/customFunction");

getTotalExhibitionData;
module.exports.getDetailExhibition = async (req, res) => {
  const { postId: id } = req.params;
  res.status(200).json({ data: await getTotalExhibitionData(id) });
};
