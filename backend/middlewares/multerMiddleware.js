const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // You can customize this folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

// Filter for image and PDF types only
const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === "images" &&
    (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
  ) {
    cb(null, true);
  } else if (
    file.fieldname === "certificate" &&
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
