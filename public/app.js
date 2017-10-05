
//Generate the HTML for the article display and return it.
function generateArticleHTML(article) {
  console.log(article._id);
return `<div class="article" >
          <div class="title"><a href="${article.link}">${article.title}</a></div>
          <div class="info">
            <p>Saved at ${article.createdAt} from somewhere by someone </p>
          </div>
          <div class="buttonlist">
            <ul>
              <li data-id="${article._id}" class="comment"><a href="#">Comments</a></li>
              <!-- <li class="delete"><a href="#">Delete</a></li> -->
            </ul>
          </div>
        </div>`
}

function generateNoteHTML(note) {
  return `<div class="note" id="${note._id}">
    <p><strong>${note.title}</strong></p>
    <p>${note.body}</p>
    <p>Created at ${note.createdAt}</p>
    <button class="delete-btn" note-id="${note._id}" >Delete</button>
  </div>`
}


// Grab the articles as a json
$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    // Display the information on the page
    $("#articles").append(generateArticleHTML(data[i]));
  }
});

// Scrape the site when you click.
$(document).on("click", "#scrape-btn", function() {
  $.get("/scrape", data => {
    console.log(data);
  })
});


// Whenever someone clicks a comment class
$(document).on("click", ".comment", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      // console.log(data);
      // The title of the note
      $("#notes").append("<h2>" + data.title + "</h2>");

      // If there's a note in the article
      if (data.notes) {
        data.notes.forEach(elem => {
          $("#notes").append(generateNoteHTML(elem))
        });
      }

      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>New Comment</button>");
    });
});

// Attach event handlers to the comment delete buttonlist
$(document).on("click", '.delete-btn', function(){
  var thisId = $(this).attr("note-id")
  $(`#${thisId}`).empty();
  $.ajax({
    method: "DELETE",
    url: "/notes/" + thisId
  });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      // console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
