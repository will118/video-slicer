const read = require('fs-readdir-recursive');
const tmp = require('tmp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoSlicer {
  constructor(folder) {
    this.extRegex = /\.mkv|\.mp4/;
    this.folder = folder;
    this.files = read(folder)
      .filter(this.extRegex.test)
      .map((filename, index) => ({ id: index, filename }));
  }

  sendClip(query, res) {
    const filename = this.files[query.id].filename;
    const filePath = path.join(this.folder, filename);

    tmp.file((err, path, fd, cleanup) => {
      if (err) throw err;
      const name = filename.replace(this.extRegex, match => `-clip${match}`);
      const headers = {'Content-Disposition': `attachment; filename="${name}"`};

      ffmpeg(filePath)
        .seekInput(query.start)
        .duration(query.duration)
        .format('mp4')
        .on('end', () => res.sendFile(path, { headers }, () => cleanup()))
        .save(path);
    });
  }
}

module.exports = VideoSlicer;
