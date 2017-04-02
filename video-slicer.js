const read = require('fs-readdir-recursive');
const tmp = require('tmp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoSlicer {
  constructor(folder) {
    this.files = read(folder).map((filename, index) => ({
      id: index, filename
    }));
    this.folder = folder;
  }

  sendClip(query, res) {
    const filename = this.files[query.id].filename;
    const filePath = path.join(this.folder, filename);

    tmp.file((err, path, fd, cleanup) => {
      if (err) throw err;

      const clipname = filename.replace(/\.mkv|\.mp4/, match => `-clip${match}`);

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
