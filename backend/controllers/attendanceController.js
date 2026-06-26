const mongoose = require('mongoose');

const StudentAttendance = require('../models/StudentAttendance');
const StaffAttendance = require('../models/StaffAttendance');
const AttendanceLog = require('../models/AttendanceLog');
const AttendanceCorrection = require('../models/AttendanceCorrection');

const Student = require('../models/Student');
const Staff = require('../models/Staff');

const ClassModel = require('../models/Class');
const SectionModel = require('../models/Section');

const toObjectId = (v) => (v ? new mongoose.Types.ObjectId(v) : null);

const normalizeDay = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.setHours(0, 0, 0, 0));
};

const startOfDay = (date) => {
  const d = normalizeDay(date);
  if (!d) return null;
  return d;
};

const endOfDay = (date) => {
  const d = normalizeDay(date);
  if (!d) return null;
  return new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1);
};

const hoursDiff = (from, to) => {
  if (!from || !to) return 0;
  const diffMs = Math.max(0, new Date(to).getTime() - new Date(from).getTime());
  return diffMs / (1000 * 60 * 60);
};

const computeStudentStatus = (status) => {
  const s = String(status || '').trim();
  return s || 'Absent';
};

const computeStaffStatus = ({ punchIn, punchOut }) => {
  // Minimal default business rules (can be enhanced later)
  if (!punchIn && !punchOut) return 'Absent';

  // Late/half-day heuristics (use 9:00 and 4.0 hours defaults)
  const nine = new Date(punchIn);
  nine.setHours(9, 0, 0, 0);

  const late = punchIn && new Date(punchIn).getTime() > nine.getTime();
  const workHours = hoursDiff(punchIn, punchOut);
  const halfDay = workHours > 0 && workHours < 4;

  if (late) return halfDay ? 'Half Day' : 'Late';
  return halfDay ? 'Half Day' : 'Present';
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const {
      q,
      classId,
      sectionId,
      from,
      to,
      month,
      year,
      academicYear,
      admissionNo,
      rollNo,
      studentName,
      subjectId,
      limit = 100,
      offset = 0,
    } = req.query;

    // Filters are best-effort given current schema (StudentAttendance is class/section based)
    const filter = {};
    if (classId) filter.classId = toObjectId(classId);
    if (sectionId) filter.sectionId = toObjectId(sectionId);
    if (subjectId) filter.subjectId = toObjectId(subjectId);

    if (from || to) {
      const f = from ? new Date(from) : new Date(0);
      const t = to ? new Date(to) : new Date();
      filter.date = { $gte: f, $lte: t };
    }

    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      if (Number.isFinite(m) && Number.isFinite(y)) {
        const d1 = new Date(y, m - 1, 1);
        const d2 = new Date(y, m, 0, 23, 59, 59, 999);
        filter.date = { $gte: d1, $lte: d2 };
      }
    }

    // Query StudentAdmission via post-filtering (since StudentAttendance stores entries array)
    const docs = await StudentAttendance.find(filter)
      .sort({ date: -1 })
      .skip(Math.max(0, Number(offset)))
      .limit(Math.min(500, Number(limit)))
      .populate({
        path: 'entries.studentId',
        model: 'Student',
        populate: { path: 'userId', select: 'name' },
      })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    // If search filters are provided, filter flattened entries.
    const qName = String(studentName || q || '').toLowerCase().trim();
    const qRoll = String(rollNo || '').toLowerCase().trim();
    const qAdmission = String(admissionNo || '').toLowerCase().trim();

    const results = [];

    for (const doc of docs) {
      const cls = doc.classId?.name || '';
      const sec = doc.sectionId?.name || '';

      for (const e of doc.entries || []) {
        const st = e.studentId;
        const admissionCandidate = st?.rollNo ? String(st.rollNo) : '';
        const admissionNoStr = admissionCandidate;
        const rollNoStr = admissionCandidate;
        const studentNameStr = st?.userId?.name || '';

        const matchesName = !qName || studentNameStr.toLowerCase().includes(qName);
        const matchesRoll = !qRoll || rollNoStr.toLowerCase().includes(qRoll);
        const matchesAdmission = !qAdmission || admissionNoStr.toLowerCase().includes(qAdmission);

        if (!matchesName || !matchesRoll || !matchesAdmission) continue;

        results.push({
          _id: doc._id,
          date: doc.date,
          class: cls,
          section: sec,
          student: {
            studentId: st?._id,
            name: studentNameStr,
            rollNo: st?.rollNo || '—',
            admissionNumber: st?.rollNo || '—',
            photo: st?.profilePhoto || '',
          },
          status: e.status,
          attendanceTime: e.attendanceTime,
          markedByTeacherId: e.markedByTeacherId,
          markedByTeacherName: e.markedByTeacherId ? undefined : undefined,
        });
      }
    }

    res.json({
      total: results.length,
      items: results,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.editStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params; // StudentAttendance doc id
    const { studentId, status, attendanceTime, markedByTeacherId } = req.body;

    if (!id || !studentId || !status) {
      return res.status(400).json({ message: 'studentId and status are required' });
    }

    const doc = await StudentAttendance.findById(id);
    if (!doc) return res.status(404).json({ message: 'Attendance record not found' });

    const idx = (doc.entries || []).findIndex((x) => String(x.studentId) === String(studentId));
    if (idx === -1) {
      doc.entries.push({
        studentId,
        status: computeStudentStatus(status),
        attendanceTime: attendanceTime ? new Date(attendanceTime) : null,
        markedByTeacherId: markedByTeacherId || null,
      });
    } else {
      doc.entries[idx].status = computeStudentStatus(status);
      doc.entries[idx].attendanceTime = attendanceTime ? new Date(attendanceTime) : doc.entries[idx].attendanceTime;
      doc.entries[idx].markedByTeacherId = markedByTeacherId || doc.entries[idx].markedByTeacherId;
    }

    doc.audit = doc.audit || {};
    doc.audit.lastEdit = {
      at: new Date(),
      by: req.user?.userId || null,
      payload: req.body,
    };

    // Create correction request record for audit (approved immediately for now)
    await AttendanceCorrection.create({
      entityType: 'student',
      studentAttendanceId: doc._id,
      entryStudentId: studentId,
      before: {},
      after: { studentId, status },
      requestedByUserId: req.user?.userId || null,
      approvedByUserId: req.user?.userId || null,
      approvedAt: new Date(),
      status: 'approved',
      note: 'Admin edit applied',
      audit: { at: new Date(), by: req.user?.userId || null },
    });

    await doc.save();

    await AttendanceLog.create({
      type: 'admin_student_edit',
      actorUserId: req.user?.userId || null,
      actorRole: req.user?.role || 'admin',
      studentId,
      classId: doc.classId,
      sectionId: doc.sectionId,
      punchTime: null,
      payload: req.body,
      audit: { editedAttendanceId: doc._id },
    });

    res.json({ message: 'Attendance updated', attendance: doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.correctStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params; // StudentAttendance doc id
    const { studentId, status, note = '' } = req.body;

    const doc = await StudentAttendance.findById(id);
    if (!doc) return res.status(404).json({ message: 'Attendance record not found' });

    const idx = (doc.entries || []).findIndex((x) => String(x.studentId) === String(studentId));
    if (idx === -1) return res.status(404).json({ message: 'Entry not found' });

    const beforeStatus = doc.entries[idx].status;

    doc.entries[idx].status = computeStudentStatus(status);

    doc.audit = doc.audit || {};
    doc.audit.lastCorrection = {
      at: new Date(),
      by: req.user?.userId || null,
      note,
      before: beforeStatus,
      after: status,
    };

    await AttendanceCorrection.create({
      entityType: 'student',
      studentAttendanceId: doc._id,
      entryStudentId: studentId,
      before: { status: beforeStatus },
      after: { status },
      requestedByUserId: req.user?.userId || null,
      approvedByUserId: req.user?.userId || null,
      approvedAt: new Date(),
      status: 'approved',
      note,
    });

    await doc.save();

    await AttendanceLog.create({
      type: 'admin_student_correct',
      actorUserId: req.user?.userId || null,
      actorRole: req.user?.role || 'admin',
      studentId,
      classId: doc.classId,
      sectionId: doc.sectionId,
      payload: req.body,
      audit: { beforeStatus, afterStatus: status },
    });

    res.json({ message: 'Correction applied', attendance: doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteStudentAttendanceEntry = async (req, res) => {
  try {
    const { id } = req.params; // StudentAttendance doc id
    const { studentId } = req.body;

    const doc = await StudentAttendance.findById(id);
    if (!doc) return res.status(404).json({ message: 'Attendance record not found' });

    doc.entries = (doc.entries || []).filter((x) => String(x.studentId) !== String(studentId));

    await AttendanceCorrection.create({
      entityType: 'student',
      studentAttendanceId: doc._id,
      entryStudentId: studentId,
      before: {},
      after: { deleted: true },
      requestedByUserId: req.user?.userId || null,
      approvedByUserId: req.user?.userId || null,
      approvedAt: new Date(),
      status: 'approved',
      note: 'Admin deleted attendance entry',
    });

    await AttendanceLog.create({
      type: 'admin_student_delete',
      actorUserId: req.user?.userId || null,
      actorRole: req.user?.role || 'admin',
      studentId,
      classId: doc.classId,
      sectionId: doc.sectionId,
      payload: req.body,
      audit: { attendanceId: doc._id },
    });

    await doc.save();

    res.json({ message: 'Entry deleted', attendance: doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getStaffAttendance = async (req, res) => {
  try {
    const {
      q,
      from,
      to,
      month,
      year,
      status,
      limit = 100,
      offset = 0,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (from || to) {
      const f = from ? new Date(from) : new Date(0);
      const t = to ? new Date(to) : new Date();
      filter.date = { $gte: f, $lte: t };
    }

    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      if (Number.isFinite(m) && Number.isFinite(y)) {
        const d1 = new Date(y, m - 1, 1);
        const d2 = new Date(y, m, 0, 23, 59, 59, 999);
        filter.date = { $gte: d1, $lte: d2 };
      }
    }

    let docs = await StaffAttendance.find(filter)
      .sort({ date: -1 })
      .skip(Math.max(0, Number(offset)))
      .limit(Math.min(500, Number(limit)))
      .populate('staffId', 'employeeId fullName department designation profilePhoto');

    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      docs = docs.filter((d) => {
        const st = d.staffId;
        const fullName = st?.fullName || '';
        return (
          String(d.employeeId || '').toLowerCase().includes(String(q).toLowerCase()) ||
          fullName.toLowerCase().includes(String(q).toLowerCase())
        );
      });
    }

    res.json({
      total: docs.length,
      items: docs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Device punch ingestion
// Expected: { employeeId, deviceName, punchType: 'in'|'out', punchTime }
exports.ingestStaffPunch = async (req, res) => {
  try {
    const { employeeId, deviceName = '', punchType, punchTime } = req.body;

    if (!employeeId || !punchType || !punchTime) {
      return res.status(400).json({ message: 'employeeId, punchType and punchTime are required' });
    }

    const staff = await Staff.findOne({ employeeId });
    if (!staff) return res.status(404).json({ message: 'Staff not found for employeeId' });

    const t = new Date(punchTime);
    if (Number.isNaN(t.getTime())) return res.status(400).json({ message: 'Invalid punchTime' });

    const day = startOfDay(t);

    const existing = await StaffAttendance.findOne({ staffId: staff._id, date: { $gte: day, $lte: endOfDay(t) } });

    const update = existing || {
      staffId: staff._id,
      employeeId: staff.employeeId,
      date: day,
      deviceName,
      punchIn: null,
      punchOut: null,
      workingHours: 0,
      overtimeHours: 0,
      status: 'Absent',
      correction: {},
      markedByDevice: true,
      processedPunch: {},
      audit: {},
    };

    if (punchType === 'in') {
      if (!update.punchIn || t.getTime() < new Date(update.punchIn).getTime()) {
        update.punchIn = t;
      }
      update.processedPunch.punchInTime = t;
    }

    if (punchType === 'out') {
      if (!update.punchOut || t.getTime() > new Date(update.punchOut).getTime()) {
        update.punchOut = t;
      }
      update.processedPunch.punchOutTime = t;
    }

    const workingHours = hoursDiff(update.punchIn, update.punchOut);
    update.workingHours = workingHours;
    update.overtimeHours = 0;

    update.status = computeStaffStatus({ punchIn: update.punchIn, punchOut: update.punchOut });

    update.deviceName = deviceName || update.deviceName;

    update.audit = update.audit || {};
    update.audit.lastIngest = {
      at: new Date(),
      by: 'device',
      employeeId,
      punchType,
      punchTime: t,
    };

    // Create ingestion log
    await AttendanceLog.create({
      type: punchType === 'in' ? 'punch_in' : 'punch_out',
      employeeId,
      staffId: staff._id,
      device: { name: deviceName },
      punchTime: t,
      payload: req.body,
      actorRole: 'device',
    });

    const saved = await StaffAttendance.findOneAndUpdate(
      { _id: update._id || undefined },
      update,
      { upsert: true, new: true }
    ).catch(async () => {
      const created = new StaffAttendance(update);
      return created.save();
    });

    res.json({ message: 'Punch ingested', attendance: saved });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.approveStaffCorrection = async (req, res) => {
  try {
    const { id } = req.params; // correction id
    const { approve, note } = req.body;

    const correction = await AttendanceCorrection.findById(id);
    if (!correction) return res.status(404).json({ message: 'Correction request not found' });

    if (correction.entityType !== 'staff') {
      return res.status(400).json({ message: 'Not a staff correction' });
    }

    if (!approve) return res.status(400).json({ message: 'approve must be true to apply' });

    const before = correction.before || {};
    const after = correction.after || {};

    const attendance = await StaffAttendance.findById(correction.staffAttendanceId);
    if (!attendance) return res.status(404).json({ message: 'Staff attendance record not found' });

    // Apply only status/punch overrides if provided
    if (after.punchIn) attendance.punchIn = after.punchIn;
    if (after.punchOut) attendance.punchOut = after.punchOut;
    if (after.status) attendance.status = after.status;
    if (after.workingHours !== undefined) attendance.workingHours = after.workingHours;

    attendance.correction = {
      approved: true,
      before,
      after,
      approvedBy: req.user?.userId || null,
      approvedAt: new Date(),
      note: note || correction.note || '',
    };

    await attendance.save();

    correction.status = 'approved';
    correction.approvedByUserId = req.user?.userId || null;
    correction.approvedAt = new Date();
    correction.audit = {
      approvedAt: new Date(),
      by: req.user?.userId || null,
      note: note || '',
    };

    await correction.save();

    await AttendanceLog.create({
      type: 'staff_correction_approved',
      actorUserId: req.user?.userId || null,
      actorRole: req.user?.role || 'admin',
      staffId: attendance.staffId,
      punchTime: null,
      payload: req.body,
      audit: { correctionId: correction._id },
    });

    res.json({ message: 'Staff correction approved', correction, attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

