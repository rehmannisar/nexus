const Meeting = require("../models/Meeting");
const crypto = require("crypto");

// Helper: check if a given user has an overlapping accepted/pending meeting
const hasConflict = async (userId, startTime, endTime, excludeMeetingId = null) => {
  const query = {
    $or: [{ organizer: userId }, { participant: userId }],
    status: { $in: ["pending", "accepted"] },
    // overlap condition: existing.start < newEnd AND existing.end > newStart
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeMeetingId) {
    query._id = { $ne: excludeMeetingId };
  }

  const conflict = await Meeting.findOne(query);
  return !!conflict;
};

// @route  POST /api/meetings   (schedule a meeting)
const scheduleMeeting = async (req, res) => {
  try {
    const { participantId, title, description, startTime, endTime } = req.body;

    if (!participantId || !title || !startTime || !endTime) {
      return res.status(400).json({
        message: "participantId, title, startTime, and endTime are required",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: "endTime must be after startTime" });
    }

    // Check conflicts for both organizer and participant
    const organizerConflict = await hasConflict(req.user._id, start, end);
    const participantConflict = await hasConflict(participantId, start, end);

    if (organizerConflict) {
      return res.status(409).json({ message: "You already have a meeting scheduled in this time slot" });
    }
    if (participantConflict) {
      return res.status(409).json({ message: "The selected participant already has a meeting in this time slot" });
    }

    const meeting = await Meeting.create({
      organizer: req.user._id,
      participant: participantId,
      title,
      description,
      startTime: start,
      endTime: end,
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/meetings   (list my meetings - as organizer or participant)
const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ organizer: req.user._id }, { participant: req.user._id }],
    })
      .populate("organizer", "name email role")
      .populate("participant", "name email role")
      .sort({ startTime: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/meetings/:id/accept
const acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.participant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the invited participant can accept this meeting" });
    }

    // Re-check conflict at accept time in case something else got booked meanwhile
    const conflict = await hasConflict(req.user._id, meeting.startTime, meeting.endTime, meeting._id);
    if (conflict) {
      return res.status(409).json({ message: "This time slot now conflicts with another meeting" });
    }

    meeting.status = "accepted";
    meeting.roomId = crypto.randomBytes(8).toString("hex"); // room for video call
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/meetings/:id/reject
const rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.participant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the invited participant can reject this meeting" });
    }

    meeting.status = "rejected";
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/meetings/:id  (cancel - organizer only)
const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the organizer can cancel this meeting" });
    }

    meeting.status = "cancelled";
    await meeting.save();

    res.json({ message: "Meeting cancelled", meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  scheduleMeeting,
  getMyMeetings,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
};
