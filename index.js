const express = require('express');
const app = express();

// json-parser to access data easily and for POST
// Without this, the 'request.body' would be undefined
// takes JSON data from request, transform into js object,
// then attaches to a 'body' property of the request object
// before the route handler is called
app.use(express.json());

// custom middleware
const requestLogger = (request, response, next) => {
    console.log("Method: ", request.method);
    console.log("Path: ", request.path);
    console.log("Body: ", request.body);
    console.log("----");
    next();
}

app.use(requestLogger);

const cors = require('cors');
app.use(cors());

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2022-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2022-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2022-05-30T19:20:14.298Z",
      important: true
    },
  ]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
    response.json(notes);
});

app.post('/api/notes', (request, response) => {
    const body = request.body;
    
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        });
    }

    const note = {
        id: generateId2(),
        content: body.content,
        important: body.important || false,
        date: new Date(),
    }

    notes = notes.concat(note);
    response.json(note);
});

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id);
    const note = notes.find(n => n.id === id);

    if (note) {
        response.json(note);
    } else {
        response.status(404).end();
    }
});

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter(note => note.id !== id);

    response.status(204).end();
});

// to catch requests made of non-existing routes defined above
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'});
}
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
const generateId = () => {
    const maxId = notes.length > 0
    ? Math.max(...notes.map(n=> n.id))
    : 0

    return maxId + 1;
}

/** Alternatively, use reduce method -
 * map returns an array, then array.reduce by
 * then comparing prev to curr number in array,
 * returning the max between them, and continue.
 * 
 * this iteration does not check for event of 0 sized notes-array
*/
const generateId2 = () => {
    return 1 + notes
        .map(n => n.id)
        .reduce((prev, curr) => Math.max(prev, curr))
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});