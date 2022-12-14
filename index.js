const express = require("express");
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
const APP_PORT = 4001;
app.use(bodyParser.json());
app.use(cors());

const COMMENTS_BY_POST_ID = {};

app.get('/', (req, res) => {
  const def_response = {
    hiThere: `I'm the comments server!`,
    useCases: [
      `GET /posts/:id/comments`,
      'POST /posts/:id/comments'
    ],
  };
  res.status(200).send(def_response);
});

app.get('/posts/:id/comments', (req, res) => {
  res.send(COMMENTS_BY_POST_ID[req.params.id] || []);
});

app.post('/posts/:id/comments', (req, res) => {
  // { content: string }
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = COMMENTS_BY_POST_ID[req.params.id] || [];

  comments.push({ id: commentId, content });

  COMMENTS_BY_POST_ID[req.params.id] = comments;

  axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
    },
  });

  res.status(201).send(comments);
});

app.post('/events', (req, res) => {
  console.log('Event received by post service', req.body.type);
  res.send({});
});


app.listen(APP_PORT, () => {
  console.log(`comments service listening on port ${APP_PORT}`);
});

