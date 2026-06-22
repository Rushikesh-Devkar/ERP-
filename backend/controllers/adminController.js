// Admin Controller - Admin dashboard features
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Fees = require('../models/Fees');

const TEACHER_CATEGORIES = [
  'teacher',
  'faculty',
  'professor',
  'assistant professor',
  'lab instructor',
  'hod',
  'class teacher',
  'senior teacher'
];

function cleanString(value) {
  return String(value || '').trim();
}

function optionalDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(',').map(item => item.trim()).filter(Boolean);
}

function buildFullName(body) {
  const fromParts = [body.first_name, body.middle_name, body.last_name]
    .map(cleanString)
    .filter(Boolean)
    .join(' ');
  return cleanString(body.name || body.fullName || fromParts);
}

async function generateEmployeeId() {
  const lastStaff = await Staff.findOne({ employeeId: /^STF\d+$/ })
    .sort({ employeeId: -1 })
    .select('employeeId');
  const lastNumber = lastStaff?.employeeId ? parseInt(lastStaff.employeeId.replace(/\D/g, ''), 10) : 0;
  const next = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;
  return `STF${String(next).padStart(5, '0')}`;
}

function isTeacherRecord(staff) {
  const haystack = [
    staff.employeeType,
    staff.employeeCategory,
    staff.designation,
    staff.roleAssignment,
    staff.subject
  ].map(value => cleanString(value).toLowerCase());

  return haystack.some(value => TEACHER_CATEGORIES.some(category => value.includes(category)));
}

function staffPayload(body, userId, employeeId, fullName) {
  const baseSalary = body.basic_salary ?? body.salary;
  const subject = body.subject || body.specialization || body.department || '';

  const docs = {};
  [
    'profile_photo',
    'aadhaar_card',
    'pan_card',
    'resume',
    'resume_cv',
    'upload_certificates',
    'educational_certificates',
    'experience_letters',
    'appointment_letter',
    'passport_size_photo',
    'other_documents',
    'signature_upload'
  ].forEach(key => {
    if (body[key]) docs[key] = cleanString(body[key]);
  });

  return {
    userId,
    employeeId,
    fullName,
    firstName: cleanString(body.first_name),
    middleName: cleanString(body.middle_name),
    lastName: cleanString(body.last_name),
    department: cleanString(body.department),
    designation: cleanString(body.designation),
    employeeType: cleanString(body.employee_type),
    employeeCategory: cleanString(body.employee_category),
    employmentStatus: cleanString(body.employment_status || body.status || 'Active'),
    status: cleanString(body.status || body.employment_status || 'Active'),
    subject: cleanString(subject),
    salary: numberValue(baseSalary),
    officialEmail: cleanString(body.official_email || body.email).toLowerCase(),
    personalEmail: cleanString(body.personal_email).toLowerCase(),
    mobileNumber: cleanString(body.mobile_number || body.phone),
    alternateMobileNumber: cleanString(body.alternate_mobile_number),
    emergencyContactName: cleanString(body.emergency_contact_name),
    emergencyContactNumber: cleanString(body.emergency_contact_number),
    dateOfBirth: optionalDate(body.date_of_birth),
    gender: cleanString(body.gender),
    bloodGroup: cleanString(body.blood_group),
    nationality: cleanString(body.nationality),
    maritalStatus: cleanString(body.marital_status),
    aadhaarNumber: cleanString(body.aadhaar_number),
    panNumber: cleanString(body.pan_number).toUpperCase(),
    currentAddress: cleanString(body.current_address),
    permanentAddress: cleanString(body.permanent_address),
    city: cleanString(body.city),
    state: cleanString(body.state),
    country: cleanString(body.country),
    pinCode: cleanString(body.pin_code),
    dateOfJoining: optionalDate(body.date_of_joining),
    reportingManager: cleanString(body.reporting_manager),
    workLocation: cleanString(body.work_location),
    shiftTiming: cleanString(body.shift_timing),
    qualificationLevel: cleanString(body.qualification_level),
    degreeName: cleanString(body.degree_name),
    specialization: cleanString(body.specialization),
    universityBoard: cleanString(body.university_board),
    passingYear: cleanString(body.passing_year),
    percentageCgpa: cleanString(body.percentage_cgpa),
    totalExperience: numberValue(body.total_experience),
    previousOrganization: cleanString(body.previous_organization),
    previousDesignation: cleanString(body.previous_designation),
    skills: cleanString(body.skills),
    certifications: cleanString(body.certifications),
    allowances: numberValue(body.allowances),
    bankName: cleanString(body.bank_name),
    accountNumber: cleanString(body.account_number),
    ifscCode: cleanString(body.ifsc_code).toUpperCase(),
    uanNumber: cleanString(body.uan_number),
    pfNumber: cleanString(body.pf_number),
    esicNumber: cleanString(body.esic_number),
    taxInformation: cleanString(body.tax_information),
    roleAssignment: cleanString(body.role_assignment),
    permissions: toArray(body.permissions),
    twoFactorAuthentication: cleanString(body.two_factor_authentication || 'Disabled'),
    attendanceMethod: cleanString(body.attendance_method),
    leaveBalance: numberValue(body.leave_balance),
    weeklyOffDays: toArray(body.weekly_off_days),
    holidayCalendarAssignment: cleanString(body.holiday_calendar_assignment),
    documents: docs,
    profilePhoto: cleanString(body.profile_photo || body.passport_size_photo),
    notesRemarks: cleanString(body.notes_remarks),
    medicalInformation: cleanString(body.medical_information),
    disabilityInformation: cleanString(body.disability_information),
    languagesKnown: cleanString(body.languages_known)
  };
}

// Create student (admin only)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, class: studentClass, rollNo, parentName } = req.body;
    
    // Create user first
    const user = new User({ name, email, password, role: 'student' });
    await user.save();

    // Create student profile
    const student = new Student({ 
      userId: user._id, 
      class: studentClass, 
      rollNo, 
      parentName 
    });
    await student.save();

    // Create default fees
    const fees = new Fees({ 
      studentId: student._id, 
      totalFees: 50000, 
      paidFees: 0 
    });
    await fees.save();

    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create staff
exports.createStaff = async (req, res) => {
  try {
    const fullName = buildFullName(req.body);
    const email = cleanString(req.body.official_email || req.body.email);
    const password = cleanString(req.body.password);

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, official email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'A user with this email already exists' });

    const employeeId = cleanString(req.body.employee_id).startsWith('STF')
      ? cleanString(req.body.employee_id)
      : await generateEmployeeId();

    const existingStaff = await Staff.findOne({ employeeId });
    if (existingStaff) return res.status(400).json({ message: 'Employee ID already exists' });

    const user = new User({ name: fullName, email, password, role: 'staff' });
    await user.save();

    const staff = new Staff(staffPayload(req.body, user._id, employeeId, fullName));
    await staff.save();

    await staff.populate('userId', 'name email role createdAt');
    res.status(201).json({ message: 'Staff created successfully', staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('userId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const {
      search,
      department,
      designation,
      status,
      teacherOnly,
      page = 1,
      limit = 200
    } = req.query;

    const query = {};
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (status) query.status = status;
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { fullName: rx },
        { employeeId: rx },
        { department: rx },
        { designation: rx },
        { officialEmail: rx },
        { mobileNumber: rx },
        { subject: rx }
      ];
    }

    let staff = await Staff.find(query)
      .populate('userId', 'name email role createdAt')
      .sort({ createdAt: -1 })
      .skip((Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1))
      .limit(Math.min(Math.max(Number(limit), 1), 500));

    if (teacherOnly === 'true') staff = staff.filter(isTeacherRecord);
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('STF') ? { employeeId: id } : { _id: id };
    const staff = await Staff.findOne(query).populate('userId', 'name email role createdAt');
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Staff.findOne(id.startsWith('STF') ? { employeeId: id } : { _id: id });
    if (!existing) return res.status(404).json({ message: 'Staff member not found' });

    const fullName = buildFullName(req.body) || existing.fullName;
    Object.assign(existing, staffPayload(req.body, existing.userId, existing.employeeId, fullName));
    await existing.save();

    if (existing.userId) {
      await User.findByIdAndUpdate(existing.userId, {
        name: existing.fullName,
        email: existing.officialEmail || req.body.email
      });
    }

    await existing.populate('userId', 'name email role createdAt');
    res.json({ message: 'Staff updated successfully', staff: existing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOneAndDelete(id.startsWith('STF') ? { employeeId: id } : { _id: id });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    if (staff.userId) await User.findByIdAndDelete(staff.userId);
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.suspendStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOneAndUpdate(
      id.startsWith('STF') ? { employeeId: id } : { _id: id },
      { status: 'Suspended', employmentStatus: 'Suspended' },
      { new: true }
    ).populate('userId', 'name email role createdAt');
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json({ message: 'Staff suspended successfully', staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const staff = await Staff.find({}).populate('userId', 'name email role createdAt').sort({ fullName: 1 });
    res.json(staff.filter(isTeacherRecord));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStaffStats = async (req, res) => {
  try {
    const staff = await Staff.find({}).select('status employmentStatus employeeType employeeCategory designation roleAssignment subject dateOfJoining');
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    res.json({
      totalStaff: staff.length,
      totalTeachers: staff.filter(isTeacherRecord).length,
      activeStaff: staff.filter(item => cleanString(item.status || item.employmentStatus).toLowerCase() === 'active').length,
      onLeave: staff.filter(item => cleanString(item.status || item.employmentStatus).toLowerCase().includes('leave')).length,
      newJoiners: staff.filter(item => item.dateOfJoining && item.dateOfJoining >= thirtyDaysAgo).length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

