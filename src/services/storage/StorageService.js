const fs = require('fs');
// const fs = require('fs/promises');
const path = require('path');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  async deleteFile(pictureUrl) {
    try {
      const filename = pictureUrl.split('/').pop();
      // const filePath = path.join(process.cwd(), 'src/api/uploads/file/pictures', filename);
      const filePath = path.join(this._folder, filename);
      await fs.promises.unlink(filePath);
      console.log(`🔥 File ${filename} berhasil dihapus dari direktori`);
    } catch (error) {
      console.error(`⚠️ Gagal menghapus file fisik: ${error.message}`);
    }
  }
}

module.exports = StorageService;
