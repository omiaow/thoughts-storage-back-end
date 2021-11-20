import form from "../models/form.js";
import answer from "../models/answer.js";

// create form
export const create = async (req, res) => {
  try {
    const { name, listOfForms } = req.body;

    if (!name || !listOfForms) {
      return res.status(400).json({ message: "Invalid form" });
    }

    if (listOfForms.length === 0) {
      return res.status(400).json({ message: "Add at least one form" });
    }

    const newForm = new form({ name: name, listOfForms: listOfForms, owner: req.user.userId });

    await newForm.save();

    res.status(201).json({ message: "Form created" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  }
};

// get all users forms
export const getAll = async (req, res) => {
  try {
    const forms = await form.find({ owner: req.user.userId });
    res.json(forms);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  }
};

// get one form by id
export const getOne = async (req, res) => {
  try {
    const data = await form.findById(req.params.id);

    let newForm = {...data._doc};

    if (newForm) {

      newForm.listOfForms.forEach((item, i) => {
        if (item.name === "check" || item.name === "radio") {
          for (let j=0; j<newForm.listOfForms[i].options.length; j++) {
            newForm.listOfForms[i].options[j].isTrue = false;
          }
        } else if (item.name === "text" || item.name === "paragraph") {
          newForm.listOfForms[i].text = "";
        }
      });

      res.json(newForm);
    } else {
      res.status(404).json({ message: "Form not found" });
    }
  } catch (e) {
    res.status(404).json({ message: "Form does not exist" });
  }
};

// submit filled form
export const submit = async (req, res) => {
  try {

    const createEndings = (number) => {
      if (number % 100 === 11 || number % 100 === 12 || number % 100 === 13) return "th";
      else if (number % 10 === 1) return "st";
      else if (number % 10 === 2) return "nd";
      else if (number % 10 === 3) return "rd";
      else return "th";
    }

    const { name, listOfForms, _id } = req.body;

    for (let i=0; i<listOfForms.length; i++) {
      let item = listOfForms[i];
      if (item.isImportant) {
        if ((item.name === "paragraph" || item.name === "text") && item.text.length === 0) {
          return res.status(400).json({ message: `Answer the ${i+1}${createEndings(i+1)} question or task` });
        } else if (item.name === "check" || item.name === "radio") {
          let isChecked = false;
          for (let j=0; j<item.options.length; j++) {
            if (item.options[j].isTrue) isChecked = true;
          }
          if (!isChecked) return res.status(400).json({ message: `Answer the ${i+1}${createEndings(i+1)} question or task` });
        } else if (item.name === "date" && !item.date) {
          return res.status(400).json({ message: `Answer the ${i+1}${createEndings(i+1)} question or task` });
        }
      }

      if (item.name === "radio") {
        let checked = 0;
        for (let j=0; j<item.options.length; j++) {
          if (item.options[j].isTrue) checked++;
        }
        if (checked > 1) return res.status(400).json({ message: `Choose one option for ${i+1}${createEndings(i+1)} question or task` });
      }
    }

    const newAnswer = new answer({
      name: name,
      answers: listOfForms,
      belongsTo: _id
    });

    await newAnswer.save();

    res.status(201).json({ message: "Form submited" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try it againg" });
  }
};

// get form and responses
export const responses = async (req, res) => {
  try {
    const responses = await answer.find({ belongsTo: req.params.id });
    const thisForm = await form.findById(req.params.id);
    res.json({form: thisForm, responses});
  } catch (e) {
    res.status(404).json({ message: "Form does not exist" });
  }
};

// delete form and responses
export const remove = async (req, res) => {
  try {
    await form.findByIdAndDelete(req.params.id);
    await answer.deleteMany({belongsTo: req.params.id});
    res.status(201).json({ message: "Form deleted" });
  } catch (e) {
    res.status(404).json({ message: "Form does not exist" });
  }
};
