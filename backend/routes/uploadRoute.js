import express from 'express';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import multer from 'multer';
import { isAuth, isAdmin } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';
import config from '../config.js';

const upload = multer();
const uploadRouter = express.Router();

aws.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

const s3 = new aws.S3();
const storageS3 = multerS3({
  s3: s3,
  bucket: 'easybuy-images',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadS3 = multer({ storage: storageS3 });
uploadRouter.post(
  '/s3',
  isAuth,
  isAdmin,
  uploadS3.single('image'),
  expressAsyncHandler(async (req, res) => {
    res.send(req.file.location);
  })
);
export default uploadRouter;
