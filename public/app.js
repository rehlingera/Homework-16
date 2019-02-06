// When the user clicks on a row in the articles table...
$(document).on("click", "tr", function () {

  // ...clear out the notes div...
  $("#notes").empty();
  $("#notesHeader").empty();
  $("#notesBody").empty();

  // ...then go get the article with the id that matches the row's data-id...
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .then(function (data) {
      // Set up conditional text for the save button
      var buttonText = "Create Comment";
      if (data.note && (data.note.body !== "" || data.note.title !== "")) {
        buttonText = "Update Comment"
      }

      // Populate a notes card in the notes div
      $("#notes").append("<h3 style='color:white;font-weight:lighter;text-align:center;width:90%'>" + data.title + "</h3>");
      $("#notes").append("<div class='card' style='width: 90%;opacity:.9'><div class='card-divider' id='notesHeader'></div><div class='card-section' id='notesBody'></div>");
      $("#notesHeader").append("<input id='titleinput' name='title' style='width:100%;font-weight:bold' >");
      $("#notesBody").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notesBody").append("<button class='button' style='margin-left:auto;margin-right:auto;display:block' data-id='" + data._id + "' id='save'>" + buttonText + "</button>");

      // If a note already exists and its content isn't empty, populate a delete button as well 
      if (data.note && (data.note.body !== "" || data.note.title !== "")) {
        $("#notesBody").append("<button class='button alert' style='margin-left:auto;margin-right:auto;display:block' data-id='" + data._id + "' id='delete'>Delete Comment</button>");
      }

      // If a note already exists, put the data into the fields
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When a user clicks the save button
$(document).on("click", "#save", function () {

  // Execute POST request to change the note, by matching the button's id with an article id, then using the data in the text fields
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function (data) {

      // Clear everything out of the notes section
      $("#notes").empty();
    });

  // Clear the text fields
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// When a user clicks the delete button...
$(document).on("click", "#delete", function () {

  // Execute POST request to change the note, by matching the button's id with an article id, then setting the article's note to empty strings
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: "",
      body: ""
    }
  })
    .then(function (data) {
      
      // Clear everything out of the notes section
      $("#notes").empty();
    });
});