const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // path/URL to stored file (local uploads/ or S3 URL)
      required: true,
    },
    fileType: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "pending_signature", "signed", "archived"],
      default: "draft",
    },
    signature: {
      signedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      signatureImageUrl: { type: String },
      signedAt: { type: Date },
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
