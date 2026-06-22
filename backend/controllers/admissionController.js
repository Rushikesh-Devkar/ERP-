const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql2/promise');

// Note: This project currently uses MongoDB elsewhere, but the admissions module is requested to be MySQL2.
// If MySQL is not configured in .env, admissions fall back to a local JSON store so the admin flow still works.
const localDataDir = path.join(__dirname, '../data');
const localAdmissionsFile = path.join(localDataDir, 'admissions.json');

function isMysqlConfigured(){
  return Boolean(process.env.MYSQL_USER && String(process.env.MYSQL_USER).trim() && process.env.MYSQL_DATABASE);
}

function getMysqlConfigForError() {
  return {
    MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
    MYSQL_PORT: process.env.MYSQL_PORT || '3306',
    hasMysqlUser: Boolean(process.env.MYSQL_USER && String(process.env.MYSQL_USER).trim()),
    hasMysqlDatabase: Boolean(process.env.MYSQL_DATABASE && String(process.env.MYSQL_DATABASE).trim()),
  };
}

function assertMysqlConfigured(res){
  const user = process.env.MYSQL_USER;
  const db = process.env.MYSQL_DATABASE;

  if(!user || !String(user).trim() || !db || !String(db).trim()){
    const cfg = getMysqlConfigForError();
    return res.status(500).json({
      message: 'MySQL is not configured for admissions. Set MYSQL_USER and MYSQL_DATABASE in .env (password is optional, depending on your MySQL setup).',
      mysqlConfig: cfg,
    });
  }
  return null;
}

function getDbPool(){
  const {
    MYSQL_HOST = 'localhost',
    MYSQL_PORT = '3306',
    MYSQL_USER,
    MYSQL_PASSWORD = '',
    MYSQL_DATABASE,
  } = process.env;

  return mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}


async function ensureAdmissionsTable(pool){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      application_no VARCHAR(32) NOT NULL UNIQUE,
      academic_year VARCHAR(16) NOT NULL,
      student_first_name VARCHAR(100) NOT NULL,
      student_middle_name VARCHAR(100) NULL,
      student_last_name VARCHAR(100) NOT NULL,
      dob DATE NOT NULL,
      age INT NULL,
      gender VARCHAR(20) NOT NULL,
      blood_group VARCHAR(20) NULL,
      nationality VARCHAR(80) NULL,
      religion VARCHAR(80) NULL,
      caste VARCHAR(80) NULL,
      caste_category VARCHAR(80) NOT NULL,
      mother_tongue VARCHAR(80) NULL,
      place_of_birth VARCHAR(150) NULL,
      aadhaar_no VARCHAR(12) NULL,
      birth_certificate_no VARCHAR(80) NULL,
      class_applying_for VARCHAR(80) NOT NULL,
      section_preference VARCHAR(20) NULL,
      previous_school_name VARCHAR(180) NULL,
      previous_school_board VARCHAR(100) NULL,
      previous_class_passed VARCHAR(80) NULL,
      percentage_last_class DECIMAL(5,2) NULL,
      tc_number VARCHAR(80) NULL,
      medium_of_instruction VARCHAR(80) NULL,
      second_language VARCHAR(80) NULL,
      third_language VARCHAR(80) NULL,
      extracurricular_activities TEXT NULL,
      special_needs VARCHAR(10) NULL,
      special_needs_details TEXT NULL,
      present_address_line1 VARCHAR(255) NOT NULL,
      present_address_line2 VARCHAR(255) NULL,
      present_city VARCHAR(100) NOT NULL,
      present_district VARCHAR(100) NOT NULL,
      present_state VARCHAR(100) NOT NULL,
      present_pincode VARCHAR(6) NOT NULL,
      is_permanent_same VARCHAR(10) NULL,
      permanent_address_line1 VARCHAR(255) NULL,
      permanent_address_line2 VARCHAR(255) NULL,
      permanent_city VARCHAR(100) NULL,
      permanent_district VARCHAR(100) NULL,
      permanent_state VARCHAR(100) NULL,
      permanent_pincode VARCHAR(6) NULL,
      student_mobile VARCHAR(10) NOT NULL,
      student_email VARCHAR(160) NULL,
      father_first_name VARCHAR(100) NOT NULL,
      father_last_name VARCHAR(100) NULL,
      father_qualification VARCHAR(100) NULL,
      father_occupation VARCHAR(120) NOT NULL,
      father_employer_name VARCHAR(180) NULL,
      father_annual_income DECIMAL(12,2) NULL,
      father_mobile VARCHAR(10) NOT NULL,
      father_email VARCHAR(160) NULL,
      father_aadhaar VARCHAR(12) NULL,
      father_pan VARCHAR(10) NULL,
      mother_first_name VARCHAR(100) NOT NULL,
      mother_last_name VARCHAR(100) NULL,
      mother_qualification VARCHAR(100) NULL,
      mother_occupation VARCHAR(120) NULL,
      mother_annual_income DECIMAL(12,2) NULL,
      mother_mobile VARCHAR(10) NOT NULL,
      mother_email VARCHAR(160) NULL,
      mother_aadhaar VARCHAR(12) NULL,
      guardian_name VARCHAR(160) NULL,
      guardian_relation VARCHAR(80) NULL,
      guardian_mobile VARCHAR(10) NULL,
      guardian_address TEXT NULL,
      emergency_contact_name VARCHAR(160) NOT NULL,
      emergency_contact_mobile VARCHAR(10) NOT NULL,
      emergency_contact_relation VARCHAR(80) NOT NULL,
      student_photo_path VARCHAR(500) NULL,
      birth_certificate_path VARCHAR(500) NULL,
      tc_document_path VARCHAR(500) NULL,
      marksheet_path VARCHAR(500) NULL,
      aadhaar_copy_path VARCHAR(500) NULL,
      caste_certificate_path VARCHAR(500) NULL,
      medical_certificate_path VARCHAR(500) NULL,
      migration_certificate_path VARCHAR(500) NULL,
      father_photo_path VARCHAR(500) NULL,
      mother_photo_path VARCHAR(500) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      admission_fee_paid VARCHAR(10) NULL,
      admission_fee_amount DECIMAL(12,2) NULL,
      remarks TEXT NULL,
      rejection_reason TEXT NULL,
      reviewed_by VARCHAR(80) NULL,
      reviewed_date DATETIME NULL,
      applied_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admissions_applied_date (applied_date),
      INDEX idx_admissions_search (application_no, student_first_name, student_last_name)
    )
  `);
}

function ensureDirSync(dir){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readLocalAdmissions(){
  ensureDirSync(localDataDir);
  if(!fs.existsSync(localAdmissionsFile)) return [];
  try{
    const parsed = JSON.parse(fs.readFileSync(localAdmissionsFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  }catch{
    return [];
  }
}

function writeLocalAdmissions(records){
  ensureDirSync(localDataDir);
  fs.writeFileSync(localAdmissionsFile, JSON.stringify(records, null, 2));
}

function getNextLocalApplicationNo(records, academic_year){
  const year = String(academic_year).split('-')[0];
  const prefix = `ADM-${year}-`;
  const maxSeq = records
    .filter(item => item.academic_year === academic_year && String(item.application_no || '').startsWith(prefix))
    .reduce((max, item) => {
      const seq = Number(String(item.application_no).replace(prefix, ''));
      return Number.isFinite(seq) ? Math.max(max, seq) : max;
    }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

// multer storage: destination: uploads/admissions/{application_no}/
const baseUploadsDir = path.join(__dirname, '../../uploads/admissions');
ensureDirSync(baseUploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // We need application_no; it is generated in controller before we accept uploads.
    // To do that with multer, we use a two-pass approach:
    // - We accept uploads into a temp folder and move after generating application_no.
    const tmpDir = path.join(baseUploadsDir, '_tmp');
    ensureDirSync(tmpDir);
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage });

// Required fields (step mapping is client-side validated; server validates basic required)
function requireBodyFields(req, res, fields){
  for(const f of fields){
    if(req.body[f] === undefined || req.body[f] === null || String(req.body[f]).trim() === ''){
      return res.status(400).json({ message: `Missing required field: ${f}` });
    }
  }
  return null;
}

function optionalText(value){
  return value === undefined || value === null || String(value).trim() === '';
}

function validateAdmissionBody(body){
  const errors = [];
  const mobileFields = [
    'student_mobile',
    'father_mobile',
    'mother_mobile',
    'emergency_contact_mobile',
    'guardian_mobile',
  ];
  const aadhaarFields = ['aadhaar_no', 'father_aadhaar', 'mother_aadhaar'];
  const emailFields = ['student_email', 'father_email', 'mother_email'];
  const pinFields = ['present_pincode', 'permanent_pincode'];
  const nameFields = [
    'student_first_name',
    'student_middle_name',
    'student_last_name',
    'nationality',
    'religion',
    'caste',
    'mother_tongue',
    'present_city',
    'present_district',
    'present_state',
    'permanent_city',
    'permanent_district',
    'permanent_state',
    'father_first_name',
    'father_last_name',
    'mother_first_name',
    'mother_last_name',
    'emergency_contact_name',
    'emergency_contact_relation',
    'guardian_name',
    'guardian_relation',
  ];

  for(const field of mobileFields){
    if(!optionalText(body[field]) && !/^\d{10}$/.test(String(body[field]).trim())){
      errors.push(`${field} must be exactly 10 digits`);
    }
  }

  for(const field of aadhaarFields){
    if(!optionalText(body[field]) && !/^\d{12}$/.test(String(body[field]).trim())){
      errors.push(`${field} must be exactly 12 digits`);
    }
  }

  for(const field of emailFields){
    if(!optionalText(body[field]) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(body[field]).trim())){
      errors.push(`${field} must be a valid email address`);
    }
  }

  for(const field of pinFields){
    if(!optionalText(body[field]) && !/^\d{6}$/.test(String(body[field]).trim())){
      errors.push(`${field} must be exactly 6 digits`);
    }
  }

  for(const field of nameFields){
    if(!optionalText(body[field]) && !/^[A-Za-z .'-]+$/.test(String(body[field]).trim())){
      errors.push(`${field} can contain only letters and spaces`);
    }
  }

  if(!optionalText(body.father_pan) && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(body.father_pan).trim().toUpperCase())){
    errors.push('father_pan must use PAN format ABCDE1234F');
  }

  if(!optionalText(body.academic_year) && !/^20\d{2}-\d{2}$/.test(String(body.academic_year).trim())){
    errors.push('academic_year must use format 2026-27');
  }

  if(!optionalText(body.percentage_last_class)){
    const marks = Number(body.percentage_last_class);
    if(Number.isNaN(marks) || marks < 0 || marks > 100){
      errors.push('percentage_last_class must be a number from 0 to 100');
    }
  }

  return errors;
}

function calculateAge(dobStr){
  const dob = new Date(dobStr);
  if(Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if(m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

// Move temp uploaded files into final folder and return final paths mapping
function moveTempToFinal(application_no){
  const tmpDir = path.join(baseUploadsDir, '_tmp');
  const finalDir = path.join(baseUploadsDir, application_no);
  ensureDirSync(finalDir);

  const moved = {};

  // files are uniquely named; we move all from tmpDir into finalDir
  const entries = fs.readdirSync(tmpDir);
  for(const name of entries){
    const src = path.join(tmpDir, name);
    const dest = path.join(finalDir, name);
    fs.renameSync(src, dest);
    moved[name] = dest;
  }

  // Clear tmpDir
  try{
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }catch{}
  ensureDirSync(tmpDir);

  return { finalDir, moved };
}

function buildAdmissionRow(req, application_no, dobAge){
  return {
    application_no,
    academic_year: req.body.academic_year,

    student_first_name: req.body.student_first_name,
    student_middle_name: req.body.student_middle_name || null,
    student_last_name: req.body.student_last_name,
    dob: req.body.dob,
    age: dobAge,
    gender: req.body.gender,
    blood_group: req.body.blood_group || null,
    nationality: req.body.nationality || 'Indian',
    religion: req.body.religion || null,
    caste: req.body.caste || null,
    caste_category: req.body.caste_category,
    mother_tongue: req.body.mother_tongue || null,
    place_of_birth: req.body.place_of_birth || null,
    aadhaar_no: req.body.aadhaar_no || null,
    birth_certificate_no: req.body.birth_certificate_no || null,

    class_applying_for: req.body.class_applying_for,
    section_preference: req.body.section_preference || null,
    previous_school_name: req.body.previous_school_name || null,
    previous_school_board: req.body.previous_school_board || null,
    previous_class_passed: req.body.previous_class_passed || null,
    percentage_last_class: req.body.percentage_last_class ? Number(req.body.percentage_last_class) : null,
    tc_number: req.body.tc_number || null,
    medium_of_instruction: req.body.medium_of_instruction || null,
    second_language: req.body.second_language || null,
    third_language: req.body.third_language || null,
    extracurricular_activities: req.body.extracurricular_activities || null,
    special_needs: req.body.special_needs || 'No',
    special_needs_details: req.body.special_needs_details || null,

    present_address_line1: req.body.present_address_line1,
    present_address_line2: req.body.present_address_line2 || null,
    present_city: req.body.present_city,
    present_district: req.body.present_district,
    present_state: req.body.present_state,
    present_pincode: req.body.present_pincode,

    is_permanent_same: req.body.is_permanent_same || 'Yes',
    permanent_address_line1: req.body.permanent_address_line1 || req.body.present_address_line1,
    permanent_address_line2: req.body.permanent_address_line2 || req.body.present_address_line2 || null,
    permanent_city: req.body.permanent_city || req.body.present_city,
    permanent_district: req.body.permanent_district || req.body.present_district,
    permanent_state: req.body.permanent_state || req.body.present_state,
    permanent_pincode: req.body.permanent_pincode || req.body.present_pincode,

    student_mobile: req.body.student_mobile,
    student_email: req.body.student_email || null,

    father_first_name: req.body.father_first_name,
    father_last_name: req.body.father_last_name || null,
    father_qualification: req.body.father_qualification || null,
    father_occupation: req.body.father_occupation,
    father_employer_name: req.body.father_employer_name || null,
    father_annual_income: req.body.father_annual_income ? Number(req.body.father_annual_income) : null,
    father_mobile: req.body.father_mobile,
    father_email: req.body.father_email || null,
    father_aadhaar: req.body.father_aadhaar || null,
    father_pan: req.body.father_pan ? String(req.body.father_pan).trim().toUpperCase() : null,

    mother_first_name: req.body.mother_first_name,
    mother_last_name: req.body.mother_last_name || null,
    mother_qualification: req.body.mother_qualification || null,
    mother_occupation: req.body.mother_occupation || null,
    mother_annual_income: req.body.mother_annual_income ? Number(req.body.mother_annual_income) : null,
    mother_mobile: req.body.mother_mobile,
    mother_email: req.body.mother_email || null,
    mother_aadhaar: req.body.mother_aadhaar || null,

    guardian_name: req.body.guardian_name || null,
    guardian_relation: req.body.guardian_relation || null,
    guardian_mobile: req.body.guardian_mobile || null,
    guardian_address: req.body.guardian_address || null,

    emergency_contact_name: req.body.emergency_contact_name,
    emergency_contact_mobile: req.body.emergency_contact_mobile,
    emergency_contact_relation: req.body.emergency_contact_relation,

    status: 'pending',
    admission_fee_paid: req.body.admission_fee_paid || 'No',
    admission_fee_amount: req.body.admission_fee_amount ? Number(req.body.admission_fee_amount) : null,
    remarks: req.body.remarks || null,
    rejection_reason: null,
  };
}

// Map multer file fieldname -> db column
const fileFieldToColumn = {
  studentPhoto: 'student_photo_path',
  birthCertificate: 'birth_certificate_path',
  tcDocument: 'tc_document_path',
  marksheet: 'marksheet_path',
  aadhaarCopy: 'aadhaar_copy_path',
  casteCertificate: 'caste_certificate_path',
  medicalCertificate: 'medical_certificate_path',
  migrationCertificate: 'migration_certificate_path',
  fatherPhoto: 'father_photo_path',
  motherPhoto: 'mother_photo_path',
};

async function getNextApplicationNo(pool, academic_year){
  // academic_year like 2024-25 -> use starting year 2024
  const year = String(academic_year).split('-')[0];
  const [rows] = await pool.query(
    'SELECT COUNT(*) as cnt FROM admissions WHERE academic_year = ? AND application_no LIKE ? ',
    [academic_year, `ADM-${year}-%`]
  );
  const cnt = rows?.[0]?.cnt || 0;
  const seq = String(cnt + 1).padStart(4, '0');
  return `ADM-${year}-${seq}`;
}

// Handle multipart: upload all possible doc fields
const multiUpload = upload.fields(
  Object.keys(fileFieldToColumn).map(k => ({ name: k, maxCount: 1 }))
);

exports.createAdmission = [
  multiUpload,
  async (req, res) => {
    try{
      // Validate minimal required
      const basicFields = [
        'academic_year',
        'student_first_name',
        'student_last_name',
        'dob',
        'gender',
        'caste_category',
        'class_applying_for',
        'academic_year',
        'present_address_line1',
        'present_city',
        'present_district',
        'present_state',
        'present_pincode',
        'student_mobile',
        'father_first_name',
        'father_occupation',
        'father_mobile',
        'mother_first_name',
        'mother_mobile',
        'emergency_contact_name',
        'emergency_contact_mobile',
        'emergency_contact_relation',
      ];
      const missing = requireBodyFields(req, res, basicFields);
      if(missing) return;

      const validationErrors = validateAdmissionBody(req.body);
      if(validationErrors.length){
        return res.status(400).json({
          message: 'Invalid admission details',
          errors: validationErrors,
        });
      }

      const mysqlErr = assertMysqlConfigured(res);
      if(mysqlErr) return;

      const pool = getDbPool();
      await ensureAdmissionsTable(pool);


      const dobAge = calculateAge(req.body.dob);
      if(dobAge === null) return res.status(400).json({ message: 'Invalid DOB' });
      if(dobAge < 2 || dobAge > 30) return res.status(400).json({ message: 'Student DOB is outside the allowed age range' });

      const application_no = await getNextApplicationNo(pool, req.body.academic_year);

      // Move files from tmp to final folder
      const moved = moveTempToFinal(application_no);

      // Build DB row: store file paths
      const row = {
        application_no,
        academic_year: req.body.academic_year,

        student_first_name: req.body.student_first_name,
        student_middle_name: req.body.student_middle_name || null,
        student_last_name: req.body.student_last_name,
        dob: req.body.dob,
        age: dobAge,
        gender: req.body.gender,
        blood_group: req.body.blood_group || null,
        nationality: req.body.nationality || 'Indian',
        religion: req.body.religion || null,
        caste: req.body.caste || null,
        caste_category: req.body.caste_category,
        mother_tongue: req.body.mother_tongue || null,
        place_of_birth: req.body.place_of_birth || null,
        aadhaar_no: req.body.aadhaar_no || null,
        birth_certificate_no: req.body.birth_certificate_no || null,

        class_applying_for: req.body.class_applying_for,
        section_preference: req.body.section_preference || null,
        previous_school_name: req.body.previous_school_name || null,
        previous_school_board: req.body.previous_school_board || null,
        previous_class_passed: req.body.previous_class_passed || null,
        percentage_last_class: req.body.percentage_last_class ? Number(req.body.percentage_last_class) : null,
        tc_number: req.body.tc_number || null,
        medium_of_instruction: req.body.medium_of_instruction || null,
        second_language: req.body.second_language || null,
        third_language: req.body.third_language || null,
        extracurricular_activities: req.body.extracurricular_activities || null,
        special_needs: req.body.special_needs || 'No',
        special_needs_details: req.body.special_needs_details || null,

        present_address_line1: req.body.present_address_line1,
        present_address_line2: req.body.present_address_line2 || null,
        present_city: req.body.present_city,
        present_district: req.body.present_district,
        present_state: req.body.present_state,
        present_pincode: req.body.present_pincode,

        is_permanent_same: req.body.is_permanent_same || 'Yes',
        permanent_address_line1: req.body.permanent_address_line1 || req.body.present_address_line1,
        permanent_address_line2: req.body.permanent_address_line2 || req.body.present_address_line2 || null,
        permanent_city: req.body.permanent_city || req.body.present_city,
        permanent_district: req.body.permanent_district || req.body.present_district,
        permanent_state: req.body.permanent_state || req.body.present_state,
        permanent_pincode: req.body.permanent_pincode || req.body.present_pincode,

        student_mobile: req.body.student_mobile,
        student_email: req.body.student_email || null,

        father_first_name: req.body.father_first_name,
        father_last_name: req.body.father_last_name || null,
        father_qualification: req.body.father_qualification || null,
        father_occupation: req.body.father_occupation,
        father_employer_name: req.body.father_employer_name || null,
        father_annual_income: req.body.father_annual_income ? Number(req.body.father_annual_income) : null,
        father_mobile: req.body.father_mobile,
        father_email: req.body.father_email || null,
        father_aadhaar: req.body.father_aadhaar || null,
        father_pan: req.body.father_pan ? String(req.body.father_pan).trim().toUpperCase() : null,

        mother_first_name: req.body.mother_first_name,
        mother_last_name: req.body.mother_last_name || null,
        mother_qualification: req.body.mother_qualification || null,
        mother_occupation: req.body.mother_occupation || null,
        mother_annual_income: req.body.mother_annual_income ? Number(req.body.mother_annual_income) : null,
        mother_mobile: req.body.mother_mobile,
        mother_email: req.body.mother_email || null,
        mother_aadhaar: req.body.mother_aadhaar || null,

        guardian_name: req.body.guardian_name || null,
        guardian_relation: req.body.guardian_relation || null,
        guardian_mobile: req.body.guardian_mobile || null,
        guardian_address: req.body.guardian_address || null,

        emergency_contact_name: req.body.emergency_contact_name,
        emergency_contact_mobile: req.body.emergency_contact_mobile,
        emergency_contact_relation: req.body.emergency_contact_relation,

        status: 'pending',
        admission_fee_paid: req.body.admission_fee_paid || 'No',
        admission_fee_amount: req.body.admission_fee_amount ? Number(req.body.admission_fee_amount) : null,
        remarks: req.body.remarks || null,
        rejection_reason: null,
      };

      // Fill file paths (use uploaded filenames -> moved mapping)
      // moved.moved maps original tmp filenames (not field names) to final dest paths.
      // We'll map using req.files to get destination filenames.
      if(req.files){
        for(const [field, col] of Object.entries(fileFieldToColumn)){
          const filesArr = req.files[field];
          if(filesArr && filesArr[0]){
            row[col] = moved.moved[filesArr[0].filename] || filesArr[0].path;
          }
        }
      }

      const columns = Object.keys(row);
      const values = columns.map(c => row[c]);

      const placeholders = columns.map(() => '?').join(',');
      const sql = `INSERT INTO admissions (${columns.join(',')}) VALUES (${placeholders})`;

      const [result] = await pool.query(sql, values);

      await pool.end();

      res.status(201).json({ success: true, application_no, id: result.insertId || null });
    }catch(err){
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
];

exports.listAdmissions = async (req, res) => {
  try{
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      academic_year,
      class_applying_for,
    } = req.query;

    const p = Math.max(1, Number(page));
    const l = Math.max(1, Math.min(100, Number(limit)));
    const offset = (p - 1) * l;

    const pool = getDbPool();
    await ensureAdmissionsTable(pool);

    const where = [];
    const params = [];

    if(status){
      where.push('status = ?');
      params.push(status);
    }
    if(academic_year){
      where.push('academic_year = ?');
      params.push(academic_year);
    }
    if(class_applying_for){
      where.push('class_applying_for = ?');
      params.push(class_applying_for);
    }

    if(search){
      where.push('(application_no LIKE ? OR student_first_name LIKE ? OR student_last_name LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(`SELECT COUNT(*) as cnt FROM admissions ${whereSql}`, params);
    const total = countRows?.[0]?.cnt || 0;

    const [rows] = await pool.query(
      `SELECT id, application_no, student_first_name, student_last_name, class_applying_for, status, applied_date, student_photo_path
       FROM admissions ${whereSql}
       ORDER BY applied_date DESC
       LIMIT ? OFFSET ?`,
      [...params, l, offset]
    );

    await pool.end();

    res.json({
      page: p,
      limit: l,
      total,
      items: rows,
    });
  }catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAdmissionById = async (req, res) => {
  try{
    const { id } = req.params;
    const pool = getDbPool();
    await ensureAdmissionsTable(pool);
    const [rows] = await pool.query('SELECT * FROM admissions WHERE id = ?', [id]);
    await pool.end();
    if(!rows || rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  }catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAdmissionStatus = async (req, res) => {
  try{
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const allowed = ['pending','under_review','approved','rejected','waitlisted'];
    if(!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const pool = getDbPool();
    await ensureAdmissionsTable(pool);
    const reviewedBy = req.user?.userId || null;

    const [result] = await pool.query(
      `UPDATE admissions
       SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_date = NOW()
       WHERE id = ?`,
      [status, rejection_reason || null, reviewedBy, id]
    );

    await pool.end();

    res.json({ success: true, affectedRows: result?.affectedRows || 0 });
  }catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try{
    const { id } = req.params;
    const pool = getDbPool();
    await ensureAdmissionsTable(pool);
    const [result] = await pool.query('DELETE FROM admissions WHERE id = ?', [id]);
    await pool.end();
    res.json({ success: true, affectedRows: result?.affectedRows || 0 });
  }catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

