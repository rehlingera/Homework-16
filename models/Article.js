var mongoose = require("mongoose");

// Create Mongoose schema constructor
var Schema = mongoose.Schema;

// Create Article schema
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  // Join Note schema to this schema
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Create model
var Article = mongoose.model("Article", ArticleSchema);

// Export
module.exports = Article;
