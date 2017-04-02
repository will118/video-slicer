const read = require('fs-readdir-recursive');
const tmp = require('tmp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoSlicer {
  constructor(folder) {
    this.folder = folder;
    this.files = read(folder)
      .filter(file => /\.mkv$|\.mp4$/.test(file))
      .map((filename, index) => ({
        id: index,
        filename,
        name: path.parse(filename).base
      }));
  }

  sendClip(query, res) {
    const { filename } = this.files.find(file => file.id === query.id);
    const filePath = path.join(this.folder, filename);

    tmp.file((err, path, fd, cleanup) => {
      if (err) throw err;
      const { name, ext } = path.parse(filename);
      const headers = {
        'Content-Disposition': `attachment; filename="${name}-clip${ext}"`
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
