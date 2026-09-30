import multer from 'multer';

// Use memory storage only — documents are never written to unencrypted disk
const storage = multer.memoryStorage();

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const originalName = (file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => originalName.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(mime);

  if (hasValidExt && hasValidMime) {
    return cb(null, true);
  }

  const err = new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
  err.code = 'INVALID_FILE_TYPE';
  err.status = 400;
  return cb(err, false);
};

// 10 MB maximum upload limit (10 * 1024 * 1024 = 10,485,760 bytes)
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

/**
 * Express wrapper for single file upload with customized, user-friendly error formatting.
 */
export function handleSingleDocumentUpload(req, res, next) {
  const singleUpload = upload.single('file');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File Too Large',
            message: 'Uploaded file exceeds the maximum allowed size of 10 MB.'
          });
        }
        return res.status(400).json({
          error: 'Upload Error',
          message: err.message
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: 'Invalid File Type',
          message: err.message
        });
      }

      return res.status(400).json({
        error: 'Upload Error',
        message: err.message || 'Error uploading file'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Missing File',
        message: 'No document file was provided in the upload request.'
      });
    }

    next();
  });
}
