// Staff Model - complete staff source of truth
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  fullName: { type: String, required: true, trim: true },
  firstName: { type: String, trim: true, default: '' },
  middleName: { type: String, trim: true, default: '' },
  lastName: { type: String, trim: true, default: '' },
  department: { type: String, trim: true, default: '' },
  designation: { type: String, trim: true, default: '' },
  employeeType: { type: String, trim: true, default: '' },
  employeeCategory: { type: String, trim: true, default: '' },
  employmentStatus: { type: String, trim: true, default: 'Active' },
  status: { type: String, trim: true, default: 'Active' },
  subject: {
    type: String,
    trim: true,
    default: ''
  },
  salary: {
    type: Number,
    default: 0
  },
  officialEmail: { type: String, trim: true, lowercase: true, default: '' },
  personalEmail: { type: String, trim: true, lowercase: true, default: '' },
  mobileNumber: { type: String, trim: true, default: '' },
  alternateMobileNumber: { type: String, trim: true, default: '' },
  emergencyContactName: { type: String, trim: true, default: '' },
  emergencyContactNumber: { type: String, trim: true, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, trim: true, default: '' },
  bloodGroup: { type: String, trim: true, default: '' },
  nationality: { type: String, trim: true, default: '' },
  maritalStatus: { type: String, trim: true, default: '' },
  aadhaarNumber: { type: String, trim: true, default: '' },
  panNumber: { type: String, trim: true, default: '' },
  currentAddress: { type: String, trim: true, default: '' },
  permanentAddress: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' },
  pinCode: { type: String, trim: true, default: '' },
  dateOfJoining: { type: Date },
  reportingManager: { type: String, trim: true, default: '' },
  workLocation: { type: String, trim: true, default: '' },
  shiftTiming: { type: String, trim: true, default: '' },
  qualificationLevel: { type: String, trim: true, default: '' },
  degreeName: { type: String, trim: true, default: '' },
  specialization: { type: String, trim: true, default: '' },
  universityBoard: { type: String, trim: true, default: '' },
  passingYear: { type: String, trim: true, default: '' },
  percentageCgpa: { type: String, trim: true, default: '' },
  totalExperience: { type: Number, default: 0 },
  previousOrganization: { type: String, trim: true, default: '' },
  previousDesignation: { type: String, trim: true, default: '' },
  skills: { type: String, trim: true, default: '' },
  certifications: { type: String, trim: true, default: '' },
  allowances: { type: Number, default: 0 },
  bankName: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  ifscCode: { type: String, trim: true, default: '' },
  uanNumber: { type: String, trim: true, default: '' },
  pfNumber: { type: String, trim: true, default: '' },
  esicNumber: { type: String, trim: true, default: '' },
  taxInformation: { type: String, trim: true, default: '' },
  roleAssignment: { type: String, trim: true, default: '' },
  permissions: [{ type: String, trim: true }],
  twoFactorAuthentication: { type: String, trim: true, default: 'Disabled' },
  attendanceMethod: { type: String, trim: true, default: '' },
  leaveBalance: { type: Number, default: 0 },
  weeklyOffDays: [{ type: String, trim: true }],
  holidayCalendarAssignment: { type: String, trim: true, default: '' },
  documents: { type: Map, of: String, default: {} },
  profilePhoto: { type: String, trim: true, default: '' },
  notesRemarks: { type: String, trim: true, default: '' },
  medicalInformation: { type: String, trim: true, default: '' },
  disabilityInformation: { type: String, trim: true, default: '' },
  languagesKnown: { type: String, trim: true, default: '' }
}, {
  timestamps: true
});

staffSchema.index({
  fullName: 'text',
  employeeId: 'text',
  department: 'text',
  designation: 'text',
  subject: 'text'
});

module.exports = mongoose.model('Staff', staffSchema);


