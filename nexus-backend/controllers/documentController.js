const Document = require("../models/Document");

// @route  POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, sharedWith } = req.body;

    const doc = await Document.create({
      uploadedBy: req.user._id,
      title: title || req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileType: req.file.mimetype,
      sharedWith: sharedWith ? JSON.parse(sharedWith) : [],
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/documents  (documents I uploaded or that are shared with me)
const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({
      $or: [{ uploadedBy: req.user._id }, { sharedWith: req.user._id }],
    })
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/documents/:id  (metadata + preview info)
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate(
      "uploadedBy",
      "name email role"
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/documents/:id/sign   (attach e-signature)
const signDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (!req.file) {
      return res.status(400).json({ message: "Signature image is required" });
    }

    doc.signature = {
      signedBy: req.user._id,
      signatureImageUrl: `/uploads/signatures/${req.file.filename}`,
      signedAt: new Date(),
    };
    doc.status = "signed";
    doc.version += 1;

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/documents/:id/share  (share with other users)
const shareDocument = async (req, res) => {
  try {
    const { userIds } = req.body; // array of user IDs
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (doc.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the uploader can share this document" });
    }

    doc.sharedWith = [...new Set([...doc.sharedWith.map(String), ...userIds])];
    await doc.save();

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  signDocument,
  shareDocument,
};
