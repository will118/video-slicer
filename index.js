const express = require('express');
const expressValidator = require('express-validator');
const VideoSlicer = require('./video-slicer');

const app = express();
const videoSlicer = new VideoSlicer(process.argv[2]);

app.use(expressValidator({
  customValidators: {
    fileExists: id => videoSlicer.files.find(file => file.id == id)
  }
}));

const key = 'foo';

const timestampRegex = /^(\d{2}:)?(\d{2}:)?(\d{2})(\.\d{2,3})?$/;

const ffmpegSchema = {
  start: {
    notEmpty: true,
    matches: { options: [timestampRegex] },
    errorMessage: "Invalid param, example: '1:02:14.500' ([[hh:]mm:]ss[.xxx])"
  },
  duration: {
    notEmpty: true,
    matches: { options: [timestampRegex] },
    errorMessage: "Invalid param, example: '11.200' ([[hh:]mm:]ss[.xxx])"
  }
};

app.get('/', (req, res) => {
  req.checkQuery('key').matches(key);
  req.checkQuery('id', 'File not found').fileExists();
  req.checkQuery(ffmpegSchema);

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send(result.mapped());
      return;
    } else {
      videoSlicer.sendClip(req.query, res);
    }
  });
});

app.get('/files', (req, res) => {
  req.checkQuery('key').matches(key);

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send(result.mapped());
      return;
    }
    res.send(videoSlicer.files);
  });
});

app.listen(9000, () => {
  console.log('Listening on 9000, key:', key);
});
