// src/utils/awsS3Chat.ts 
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import https from 'https';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  }),
});

const bucketName = process.env.AWS_BUCKET_NAME!;

function fileFilter (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedFileTypes = ['application/zip','application/octet-stream','text/plain','application/x-rar-compressed','application/x-tar','application/x-7z-compressed'];

  if (file.fieldname === 'images') {
    if (allowedImageMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, and GIF are allowed.'));
    }
  } else if (file.fieldname === 'file') {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only certain compressed or text files are allowed.'));
    }
  } else {
    cb(new Error('Invalid field name for file upload.'));
  }
}

export const uploadChatFiles = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: any, file, cb) => {
      const chatRoomId = req.params.id;
      const timestamp = Date.now();
      const userId = req.user?.id;

      if (file.fieldname === 'images') {
        cb(null, `chatrooms/${chatRoomId}/users/${userId}/images/${timestamp}_${file.originalname}`);
      } else if (file.fieldname === 'file') {
        cb(null, `chatrooms/${chatRoomId}/users/${userId}/files/${timestamp}_${file.originalname}`);
      } else {
        cb(new Error('Unknown field name.'), '');
      }
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter,
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'file', maxCount: 1 },
]);
