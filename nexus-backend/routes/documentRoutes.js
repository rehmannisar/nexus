const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  signDocument,
  shareDocument,
} = require("../controllers/documentController");
const { protect } = require("../middleware/auth");
const { uploadDocument: uploadDocMiddleware, uploadSignature } = require("../middleware/upload");

router.post("/upload", protect, uploadDocMiddleware.single("file"), uploadDocument);
router.get("/", protect, getMyDocuments);
router.get("/:id", protect, getDocumentById);
router.post("/:id/sign", protect, uploadSignature.single("signature"), signDocument);
router.put("/:id/share", protect, shareDocument);

module.exports = router;
