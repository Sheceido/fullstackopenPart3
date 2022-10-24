require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Note = require("./models/note");

const app = express();
// json-parser to access data easily and for POST
// Without this, the 'request.body' would be undefined
// takes JSON data from request, transform into js object,
// then attaches to a 'body' property of the request object
// before the route handler is called
app.use(express.static("build"));
app.use(express.json());

// custom middleware
const requestLogger = (request, response, next) => {
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.body);
  console.log("----");
  next();
};

app.use(requestLogger);
app.use(cors());

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
  Note
    .find({})
    .then(notes => {
      response.json(notes);
    });
});

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });

  note
    .save()
    .then(savedNote => {
      response.json(savedNote);
    })
    .catch(error => next(error));
});

app.get("/api/notes/:id", (request, response, next) => {
  Note
    .findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body;

  Note
    .findByIdAndUpdate(
      request.params.id,
      { content, important },
      { new: true, runValidators: true, context: "query" }
    )
    .then(updatedNote => {
      response.json(updatedNote);
    })
    .catch(error => next(error));
});

app.delete("/api/notes/:id", (request, response, next) => {
  Note
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => next(error));

});

// to catch requests made of non-existing routes defined above
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
/**
 * notes.map -> creates a new array that contains all the
 * ids of the notes. Math.max returns the maximum value
 * of the numbers that are passed to it. However,
 * notes.map(n => n.id) is an array so it can't directly
 * be given as a parameter to Math.max. The array can be
 * transformed into individual numbers by using the
 * "three dot" spread syntax ....
 */
// const generateId = () => {
//     const maxId = notes.length > 0
//     ? Math.max(...notes.map(n=> n.id))
//     : 0

//     return maxId + 1;
// }

/** Alternatively, use reduce method -
 * map returns an array, then array.reduce by
 * then comparing prev to curr number in array,
 * returning the max between them, and continue.
 *
 * this iteration does not check for event of 0 sized notes-array
*/
// const generateId2 = () => {
//     return 1 + notes
//         .map(n => n.id)
//         .reduce((prev, curr) => Math.max(prev, curr))
// }

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
// Express' error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});