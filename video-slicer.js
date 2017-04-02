const fs = require('fs');
const tmp = require('tmp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoSlicer {
  constructor(folder) {
    this.files = fs.readdirSync(folder).filter(x => !x.startsWith('.'));
    this.folder = folder;
  }

  sendClip(query, res) {
    const filePath = path.join(this.folder, query.filename);

    tmp.file((err, path, fd, cleanup) => {
      if (err) throw err;

      const clipname = query.filename
        .replace(/\.mkv|\.mp4/, match => `-clip${match}`);

      const headers = {
        'Content-Disposition': `attachment; filename="${clipname}"`
      };

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
