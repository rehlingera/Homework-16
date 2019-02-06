var mongoose = require("mongoose");

// Create Mongoose schema constructor
var Schema = mongoose.Schema;

// Create Note schema
var NoteSchema = new Schema({
  title: String,
  body: String
});

// Create model
var Note = mongoose.model("Note", NoteSchema);

// Export
module.exports = Note;
