require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Note = require('./models/note');

const app = express();
// json-parser to access data easily and for POST
// Without this, the 'request.body' would be undefined
// takes JSON data from request, transform into js object,
// then attaches to a 'body' property of the request object
// before the route handler is called
app.use(express.static('build'));
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
app.use(cors());

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
    Note
        .find({})
        .then(notes => {
            response.json(notes);
        });
});

app.post('/api/notes', (request, response) => {
    const body = request.body;
    
    if (body.content === undefined) {
        return response.status(400).json({error: 'content missing'});
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });

    note
        .save()
        .then(savedNote => {
            response.json(savedNote);
        });
});

app.get('/api/notes/:id', (request, response) => {
    Note
        .findById(request.params.id)
        .then(note => {
            response.json(note);
        })
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});