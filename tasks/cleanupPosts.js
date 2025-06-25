const Post = require('../models/Post');

let ioInstance;
function setIo(io) {
  ioInstance = io;
}

async function deleteOldPosts() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oldPosts = await Post.find({
    createdAt: { $lt: twentyFourHoursAgo },
    status: { $ne: 'resolved' }
  });
  if (oldPosts.length > 0) {
    await Post.deleteMany({ _id: { $in: oldPosts.map(post => post._id) } });
    if (ioInstance) {
      oldPosts.forEach(post => {
        ioInstance.to(`post_${post._id}`).emit('postDeleted', post._id);
      });
    }
  }
}

function scheduleCleanup() {
  setInterval(deleteOldPosts, 60 * 60 * 1000);
}

module.exports = {
  setIo,
  deleteOldPosts,
  scheduleCleanup
}; 