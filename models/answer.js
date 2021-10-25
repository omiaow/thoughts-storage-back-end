import mongoose from "mongoose";

const answerSchema = mongoose.Schema({
  name: { type: String, required: true },
  answers: [{ type: Object, required: true }],
  belongsTo: { type: mongoose.Types.ObjectId, ref: "user", required: true },
  source: { data: Buffer, contentType: String }
});

const answer = mongoose.model("answer", answerSchema);

export default answer;
