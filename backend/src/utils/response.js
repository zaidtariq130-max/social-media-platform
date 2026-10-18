/** One success format for the whole API: { success: true, ...payload } */
const sendSuccess = (res, payload = {}, status = 200) =>
  res.status(status).json({ success: true, ...payload });

module.exports = { sendSuccess };
