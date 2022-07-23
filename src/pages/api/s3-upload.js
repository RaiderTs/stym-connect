import { APIRoute } from 'next-s3-upload';
import md5 from 'md5';
export default APIRoute.configure({
  async key(req, filename) {
    // console.log("🚀 ~ file: s3-upload.js ~ line 5 ~ key ~ filename", filename)
    let stymId = req.body.stymId ? req.body.stymId : ''; // * stym name eslint-disable-line
    let stymHash = md5(`${stymId}`);
    let email = md5(req.body.email);
    let folderId = md5(`${req.body.folderId}`);
    // console.log(stymId, 'stymId');
    // console.log(stymHash, 'stymHash');
    let sanitizedFilename = filename;
    // console.log("🚀 ~ sanitizedFilename", sanitizedFilename)
    if (stymId === '') {
      let path = `public/${email}/${sanitizedFilename}`;
      return path;
    }

    const path = `public/${email}/${stymHash}/${folderId}/${sanitizedFilename}`;
    console.log(path, 'path');

    return path;
  },
});
