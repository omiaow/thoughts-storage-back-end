import mongoose from "mongoose";

const formSchema = mongoose.Schema({
  name: { type: String, required: true },
  listOfForms: [{ type: Object }],
  owner: { type: mongoose.Types.ObjectId, ref: "user" }
});

const form = mongoose.model("form", formSchema);

export default form;
