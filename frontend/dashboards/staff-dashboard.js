/*
  Staff Dashboard - modular view renderer + placeholder API integration.
  Connect this to real backend endpoints later.
*/

(function(){
  const API = {
    attendance: '/staff/attendance',
    students: '/staff/students',
    marks: '/staff/marks',
    assignments: '/staff/assignments',
    studyMaterials: '/staff/study-materials',
    leaves: '/staff/leaves',
    salary: '/staff/salary',
    announcements: '/staff/announcements',
    messages: '/staff/messages',
    documents: '/staff/documents',
    reports: '/staff/reports'
  };

  const demo = {
    teacher: {
      name: 'Ms. Neha Verma',
      department: 'Computer Science',
      photoUrl: ''
    },
    metrics: {
      totalClasses: 5,
      totalStudents: 142,
      attendanceThisMonthPct: 93.4,
      marksSubmitted: 76,
      assignmentsGiven: 22,
      leaveBalance: 7,
      salaryThisMonth: 48000
    },
    attendanceOverview: {
      present: 118,
      absent: 7,
      leave: 17,
      percentage: 93.4
    },
    attendanceAnalyticsMonthly: {
      labels: ['Week 1','Week 2','Week 3','Week 4'],
      present: [27, 29, 30, 32],
      absent: [1, 2, 1, 3],
      leave: [4, 2, 3, 2]
    },
    classes: [
      { id:'C1', className:'Class 9 - A', subject:'Computer', totalStudents: 28, strength: 27 },
      { id:'C2', className:'Class 10 - B', subject:'Programming', totalStudents: 30, strength: 29 },
      { id:'C3', className:'Class 11 - A', subject:'Data Structures', totalStudents: 26, strength: 25 },
      { id:'C4', className:'Class 12 - C', subject:'Algorithms', totalStudents: 26, strength: 24 },
      { id:'C5', className:'Class 8 - A', subject:'Cyber Basics', totalStudents: 32, strength: 27 }
    ],
    timetableToday: [
      { time:'09:00 - 09:50', subject:'Computer', classText:'Class 9 - A', room:'R-204' },
      { time:'10:00 - 10:50', subject:'Programming', classText:'Class 10 - B', room:'Lab-1' },
      { time:'11:10 - 12:00', subject:'Data Structures', classText:'Class 11 - A', room:'R-310' },
      { time:'12:30 - 01:20', subject:'Algorithms', classText:'Class 12 - C', room:'Lab-2' }
    ],
    studentsTable: [
      { id:'S1', name:'Aarav Sharma', rollNo:'10B-023', parent:'R. Sharma', attendance:'Present', marks: '87%', performance:'Good' },
      { id:'S2', name:'Diya Gupta', rollNo:'10B-007', parent:'S. Gupta', attendance:'On Leave', marks: '92%', performance:'Excellent' },
      { id:'S3', name:'Kabir Singh', rollNo:'10B-031', parent:'R. Singh', attendance:'Absent', marks: '75%', performance:'Needs Improvement' }
    ],
    recentAttendance: [
      { date:'2026-05-30', classText:'Class 10 - B', subject:'Programming', present: 28, absent: 2, action:'—' },
      { date:'2026-05-29', classText:'Class 10 - B', subject:'Programming', present: 26, absent: 4, action:'—' },
      { date:'2026-05-28', classText:'Class 10 - B', subject:'Programming', present: 27, absent: 3, action:'—' }
    ],
    recentMarks: [
      { exam:'Unit Test 3', classText:'Class 10 - B', subject:'Programming', marksUploaded: '28/30', date:'2026-05-29' },
      { exam:'Project Submission', classText:'Class 10 - B', subject:'Programming', marksUploaded: 'Complete', date:'2026-05-24' }
    ],
    leaveManagement: {
      myLeaves: [
        { date:'2026-06-05', reason:'Medical', status:'Approved' },
        { date:'2026-06-15', reason:'Personal Work', status:'Pending' },
        { date:'2026-05-20', reason:'Family Function', status:'Rejected' }
      ]
    },
    studentLeaveRequests: [
      { studentName:'Diya Gupta', classText:'Class 10 - B', reason:'Fever', leaveDays:2, recommendation:'Recommend Approved', id:'LR1' },
      { studentName:'Kabir Singh', classText:'Class 10 - B', reason:'Family Emergency', leaveDays3, recommendation:'Forward to Principal', id:'LR2' }
    ],
    salary: {
      current: 48000,
      allowances: 12000,
      deductions: 3000,
      net: 47000
    },
    announcements: [
      { title:'PTM Schedule Released', date:'2026-06-01', type:'Meeting' },
      { title:'Midterm Exam Window', date:'2026-06-05', type:'Exam' },
      { title:'Library Books Return Deadline', date:'2026-06-07', type:'Notice' }
    ],
    messages: [
      { from:'Principal', date:'2026-06-01', preview:'Please submit attendance within 10 minutes of class start.' },
      { from:'Coordinator', date:'2026-05-29', preview:'Upload study material for Unit 4 by EOD tomorrow.' }
    ],
    documents: [
      { name:'Class Report Template', type:'PDF', id:'D1' },
      { name:'Attendance Guidelines', type:'DOCX', id:'D2' }
    ]
  };

  // Utilities
  const safeText = (v) => (v === null || v === undefined ? '—' : String(v));
  const formatINR = (num) => {
    const n = Number(num || 0);
    try { return n.toLocaleString('en-IN'); } catch { return String(n); }
  };

  // Auth guard + init
  function init(){
    if(typeof DashUI !== 'undefined' && DashUI.ensureRole) DashUI.ensureRole('staff');
    if(typeof DashUI !== 'undefined' && DashUI.hydrateSidebarCollapse) DashUI.hydrateSidebarCollapse();

    // Welcome area
    const welcomeName = document.getElementById('welcomeTeacherName');
    const teacherDept = document.getElementById('teacherDepartment');
    const currentDateEl = document.getElementById('currentDate');
    if(welcomeName) welcomeName.textContent = demo.teacher.name;
    if(teacherDept) teacherDept.textContent = demo.teacher.department;
    if(currentDateEl) currentDateEl.textContent = new Date().toLocaleDateString();

    // Metrics
    const setMetric = (id, value) => {
      const el = document.getElementById(id);
      if(el) el.textContent = value;
    };
    setMetric('w-total-classes', demo.metrics.totalClasses);
    setMetric('w-total-students', demo.metrics.totalStudents);
    setMetric('w-attendance-this-month', demo.metrics.attendanceThisMonthPct + '%');
    setMetric('w-marks-submitted', demo.metrics.marksSubmitted);
    setMetric('w-assignments-given', demo.metrics.assignmentsGiven);
    setMetric('w-leave-balance', demo.metrics.leaveBalance);
    setMetric('w-salary-this-month', '₹ ' + formatINR(demo.metrics.salaryThisMonth));

    // Default view
    renderView('dashboard');

    // Charts (attendance)
    window.addEventListener('load', () => {
      try{
        renderAttendanceAnalyticsCharts();
        renderAttendanceCircle();
        renderClassPerformanceChart();
        renderStudentProgressChart();
      }catch(e){ console.warn('Staff chart init failed', e); }
    });

    // Profile dropdown quick actions
    const profileBtn = document.getElementById('staffProfileDropdownBtn');
    if(profileBtn){ /* no-op; bootstrap handles dropdown */ }

    // Messages bell demo notifications
    window.addEventListener('dash:toast', (e) => {
      // e.detail is message key
    });

    bindQuickActions();
    bindApplyLeaveForm();
    bindAttendanceForm();
    bindMarksForm();
    bindStudentRemarksForm();
  }

  // API placeholder wrappers
  async function apiCall(endpoint, options = {}){
    if(typeof DashAPI !== 'undefined' && DashAPI.apiCall){
      return DashAPI.apiCall(endpoint, options);
    }
    // Fallback demo-only
    await new Promise(r => setTimeout(r, 250));
    return { ok:true };
  }

  // Navigation rendering
  function setActiveNav(viewKey){
    if(typeof DashUI !== 'undefined' && DashUI.setActiveNav) DashUI.setActiveNav(viewKey);
    document.querySelectorAll('[data-staff-nav]').forEach(el => {
      const v = el.getAttribute('data-staff-nav');
      el.classList.toggle('active', v === viewKey);
    });
  }

  function renderView(viewKey){
    setActiveNav(viewKey);
    const root = document.getElementById('staff-mainContent');
    if(!root) return;

    const views = {
      dashboard: renderDashboardView(),
      attendance: renderAttendanceView(),
      marks: renderMarksView(),
      assignments: renderAssignmentsView(),
      studyMaterials: renderStudyMaterialsView(),
      examSchedule: renderExamScheduleView(),
      timetable: renderTimetableView(),
      studentProfiles: renderStudentProfilesView(),
      studentPerformance: renderStudentPerformanceView(),
      studentRemarks: renderStudentRemarksView(),
      studentLeaveRequests: renderStudentLeaveRequestsView(),
      attendanceReports: renderAttendanceReportsView(),
      marksReports: renderMarksReportsView(),
      classPerformanceReports: renderClassPerformanceReportsView(),
      applyLeave: renderApplyLeaveView(),
      leaveHistory: renderLeaveHistoryView(),
      salaryDetails: renderSalaryDetailsView(),
      salaryHistory: renderSalaryHistoryView(),
      salarySlipDownload: renderSalarySlipDownloadView(),
      announcements: renderAnnouncementsView(),
      messages: renderMessagesView(),
      documents: renderDocumentsView(),
      classReports: renderClassReportsView()
    };

    root.innerHTML = views[viewKey] || renderDashboardView();
  }

  // Dashboard view sections
  function renderDashboardView(){
    return `
      <div class="row g-3">
        <div class="col-12 col-xl-8">
          <div class="card-glass-light p-3">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 class="glass-title section-title m-0"><i class="fa-solid fa-gauge-high me-2"></i>Staff Performance Overview</h5>
                <div class="text-muted" style="color:rgba(27,42,74,.65)!important;">Analytics + today’s operational view.</div>
              </div>
              <span class="badge rounded-pill bg-transparent" style="border:1px solid rgba(27,42,74,.15); color:rgba(27,42,74,.7);">Live demo</span>
            </div>

            <div class="row g-3">
              <div class="col-12 col-lg-7">
                <div class="card-glass p-3 h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="glass-title m-0"><i class="fa-solid fa-chart-area me-2"></i>Attendance Analytics</h5>
                    <span class="badge badge-soft rounded-pill">Monthly</span>
                  </div>
                  <div class="row g-3 mt-1">
                    <div class="col-12 col-md-4">
                      <div style="height:190px; position:relative;">
                        <canvas id="staff-attendanceCircle" height="190"></canvas>
                      </div>
                      <div class="mt-2">
                        <div class="d-flex justify-content-between">
                          <div class="fw-bold" style="color:rgba(234,240,255,.75)!important;">Attendance %</div>
                          <div class="fw-extrabold" id="staff-attendancePct">${demo.attendanceOverview.percentage}%</div>
                        </div>
                        <div class="d-flex justify-content-between mt-1">
                          <div class="fw-bold" style="color:rgba(234,240,255,.75)!important;">Present</div>
                          <div class="fw-extrabold" id="staff-presentCount">${demo.attendanceOverview.present}</div>
                        </div>
                        <div class="d-flex justify-content-between mt-1">
                          <div class="fw-bold" style="color:rgba(234,240,255,.75)!important;">Absent</div>
                          <div class="fw-extrabold" id="staff-absentCount">${demo.attendanceOverview.absent}</div>
                        </div>
                        <div class="d-flex justify-content-between mt-1">
                          <div class="fw-bold" style="color:rgba(234,240,255,.75)!important;">Leave</div>
                          <div class="fw-extrabold" id="staff-leaveCount">${demo.attendanceOverview.leave}</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-md-8">
                      <div class="bg-white bg-opacity-0 p-2" style="border-radius:14px;">
                        <div class="mb-2 d-flex align-items-center justify-content-between">
                          <div class="fw-bold"><i class="fa-solid fa-calendar-days me-2" style="color:rgba(33,212,253,.95)"></i>Monthly Attendance</div>
                          <span class="badge badge-soft rounded-pill">Demo</span>
                        </div>
                        <canvas id="staff-attendanceAnalytics" height="170"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-lg-5">
                <div class="card-glass p-3 h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="glass-title m-0"><i class="fa-solid fa-layer-group me-2"></i>Quick Operational Metrics</h5>
                    <span class="badge badge-amber rounded-pill">This month</span>
                  </div>
                  <div class="row g-3">
                    <div class="col-12">
                      <div class="d-flex align-items-center justify-content-between p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                        <div>
                          <div class="fw-bold"><i class="fa-solid fa-user-plus me-2" style="color:rgba(109,94,252,.95)"></i>Total Classes</div>
                          <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:700;">Assigned to you</div>
                        </div>
                        <div class="fw-extrabold" style="font-size:1.6rem" id="dash-totalClasses">${demo.metrics.totalClasses}</div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex align-items-center justify-content-between p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                        <div>
                          <div class="fw-bold"><i class="fa-solid fa-people-group me-2" style="color:rgba(34,197,94,.95)"></i>Total Students</div>
                          <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:700;">Active roster</div>
                        </div>
                        <div class="fw-extrabold" style="font-size:1.6rem" id="dash-totalStudents">${demo.metrics.totalStudents}</div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex align-items-center justify-content-between p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                        <div>
                          <div class="fw-bold"><i class="fa-solid fa-check-circle me-2" style="color:rgba(33,212,253,.95)"></i>Marks Submitted</div>
                          <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:700;">Uploads done</div>
                        </div>
                        <div class="fw-extrabold" style="font-size:1.6rem" id="dash-marksSubmitted">${demo.metrics.marksSubmitted}</div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex align-items-center justify-content-between p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                        <div>
                          <div class="fw-bold"><i class="fa-solid fa-clipboard-check me-2" style="color:rgba(245,158,11,.95)"></i>Assignments Given</div>
                          <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:700;">Planned</div>
                        </div>
                        <div class="fw-extrabold" style="font-size:1.6rem" id="dash-assignmentsGiven">${demo.metrics.assignmentsGiven}</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3">
                    <button class="btn btn-accent rounded-pill w-100" onclick="StaffApp.go('attendance')">
                      <i class="fa-solid fa-calendar-check me-2"></i>Mark Attendance
                    </button>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="card-glass-light p-3">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="glass-title m-0"><i class="fa-solid fa-table me-2"></i>My Classes</h5>
                    <button class="btn btn-soft rounded-pill" onclick="StaffApp.go('studentProfiles')">View Students</button>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Class Name</th>
                          <th>Subject</th>
                          <th>Total Students</th>
                          <th>Class Strength</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${demo.classes.map(c => `
                          <tr>
                            <td><strong>${c.className}</strong></td>
                            <td>${c.subject}</td>
                            <td>${c.totalStudents}</td>
                            <td>${c.strength}</td>
                            <td>
                              <button class="btn btn-sm btn-accent rounded-pill" onclick="StaffApp.openClassDetails('${c.id}')">View Class Details</button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="card-glass p-3">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="glass-title m-0"><i class="fa-solid fa-table-list me-2"></i>Today Timetable</h5>
                    <button class="btn btn-soft rounded-pill" onclick="StaffApp.go('timetable')">Open Timetable</button>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Subject</th>
                          <th>Class</th>
                          <th>Room Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${demo.timetableToday.map(r => `
                          <tr>
                            <td>${r.time}</td>
                            <td>${r.subject}</td>
                            <td>${r.classText}</td>
                            <td>${r.room}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="card-glass-light p-3">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="glass-title m-0"><i class="fa-solid fa-bolt me-2"></i>Quick Actions</h5>
                    <span class="badge badge-soft rounded-pill">Ready for backend integration</span>
                  </div>
                  <div class="row g-2">
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.markAttendance()"><i class="fa-solid fa-calendar-check me-2"></i>Mark Attendance</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.enterMarks()"><i class="fa-solid fa-star-half-stroke me-2"></i>Enter Marks</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.uploadAssignment()"><i class="fa-solid fa-upload me-2"></i>Upload Assignment</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.uploadStudyMaterial()"><i class="fa-solid fa-book me-2"></i>Upload Study Material</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-accent rounded-pill w-100" onclick="StaffApp.applyLeave()"><i class="fa-solid fa-plane-departure me-2"></i>Apply Leave</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('timetable')"><i class="fa-solid fa-table me-2"></i>View Timetable</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('studentProfiles')"><i class="fa-solid fa-user-group me-2"></i>View Students</button></div>
                    <div class="col-12 col-md-4 col-lg-2"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.downloadSalarySlip()"><i class="fa-solid fa-file-invoice-dollar me-2"></i>Download Salary Slip</button></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="card-glass p-3 h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="glass-title m-0"><i class="fa-solid fa-bell me-2"></i>Announcements & Messages</h5>
              <span class="badge badge-soft rounded-pill">Today</span>
            </div>

            <div class="d-flex flex-column gap-2" id="staff-notifList">
              ${demo.announcements.map(a => `
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold"><i class="fa-solid fa-bullhorn me-2" style="color:rgba(33,212,253,.95)"></i>${a.title}</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">${a.type} • ${new Date(a.date).toLocaleDateString()}</div>
                </div>
              `).join('')}
            </div>

            <div class="mt-3 d-flex align-items-center justify-content-between">
              <h6 class="m-0" style="color:rgba(234,240,255,.85)!important; font-weight:900;"><i class="fa-regular fa-message me-2"></i>Messages</h6>
              <button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.go('messages')">Open</button>
            </div>

            <div class="d-flex flex-column gap-2 mt-2" id="staff-msgList">
              ${demo.messages.map(m => `
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold"><i class="fa-solid fa-circle-user me-2" style="color:rgba(109,94,252,.95)"></i>${m.from}</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">${m.preview}</div>
                  <div class="small" style="color:rgba(234,240,255,.55)!important; margin-top:4px;">${new Date(m.date).toLocaleDateString()}</div>
                </div>
              `).join('')}
            </div>

            <div class="mt-3">
              <button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('documents')">
                <i class="fa-solid fa-file-arrow-up me-2"></i>Access Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAttendanceView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-calendar-check me-2"></i>Manage Attendance</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.renderDefaultAttendanceAnalytics()"><i class="fa-solid fa-rotate me-2"></i>Refresh Analytics</button>
            <button class="btn btn-accent rounded-pill" onclick="StaffApp.saveAttendance()"><i class="fa-solid fa-floppy-disk me-2"></i>Submit Attendance</button>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="mb-2 d-flex align-items-center justify-content-between">
                <div class="fw-bold"><i class="fa-solid fa-users me-2"></i>Attendance Taking</div>
                <span class="badge badge-soft rounded-pill">Placeholder form</span>
              </div>
              <div id="staff-attendanceFormMount"></div>
            </div>
          </div>

          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <h6 class="glass-title m-0 mb-3"><i class="fa-solid fa-chart-line me-2"></i>Recent Attendance Summary</h6>
              <div class="table-responsive">
                <table class="table table-modern mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${demo.recentAttendance.map(r => `
                      <tr>
                        <td>${new Date(r.date).toLocaleDateString()}</td>
                        <td>${r.classText}</td>
                        <td>${r.present}</td>
                        <td>${r.absent}</td>
                        <td><button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.viewAttendanceDetail('${r.date}')">View</button></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="mt-3">
                <button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('attendanceReports')"><i class="fa-solid fa-file-lines me-2"></i>Generate Attendance Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMarksView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-star-half-stroke me-2"></i>Manage Marks</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.loadMarksDemo()"><i class="fa-solid fa-rotate me-2"></i>Load Demo</button>
            <button class="btn btn-accent rounded-pill" onclick="StaffApp.saveMarks()"><i class="fa-solid fa-floppy-disk me-2"></i>Submit Marks</button>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-6">
            <div class="card-glass-light p-3 h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="fw-bold"><i class="fa-solid fa-pen-to-square me-2"></i>Upload / Enter Marks</div>
                <span class="badge badge-soft rounded-pill">Placeholder API</span>
              </div>
              <div id="staff-marksFormMount"></div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="card-glass p-3 h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="fw-bold"><i class="fa-solid fa-clipboard-list me-2"></i>Recent Marks</div>
                <button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.go('marksReports')">Reports</button>
              </div>
              <div class="table-responsive">
                <table class="table table-modern mb-0">
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Marks Uploaded</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${demo.recentMarks.map(r => `
                      <tr>
                        <td>${r.exam}</td>
                        <td>${r.classText}</td>
                        <td>${r.subject}</td>
                        <td>${r.marksUploaded}</td>
                        <td>${new Date(r.date).toLocaleDateString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAssignmentsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-clipboard-list me-2"></i>Manage Assignments</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.uploadAssignment()"><i class="fa-solid fa-upload me-2"></i>Upload</button>
            <button class="btn btn-accent rounded-pill" onclick="StaffApp.go('classReports')"><i class="fa-solid fa-chart-pie me-2"></i>Class Reports</button>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-file-upload me-2"></i>Assignment Upload (Placeholder)</div>
              <div class="small" style="color:rgba(27,42,74,.65)!important; font-weight:700;">Connect this to Attendance API later: ${API.assignments}</div>
              <div class="mt-3">
                <input class="form-control" type="file" onchange="StaffApp.onAssignmentFileSelected(this.files)" />
              </div>
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-6"><input class="form-control" id="assignmentTitle" placeholder="Assignment Title" /></div>
                <div class="col-12 col-md-6"><input class="form-control" id="assignmentDue" placeholder="Due Date" /></div>
              </div>
              <div class="mt-3"><button class="btn btn-accent rounded-pill" onclick="StaffApp.submitAssignment()"><i class="fa-solid fa-paper-plane me-2"></i>Submit Assignment</button></div>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <h6 class="glass-title m-0 mb-3"><i class="fa-solid fa-clock-rotate-left me-2"></i>Latest Assignments (Demo)</h6>
              <div class="d-flex flex-column gap-2">
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">Unit 4 Worksheet <span class="text-muted" style="color:rgba(234,240,255,.6)!important;">• Due 2026-06-10</span></div>
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">Project: Mini App <span class="text-muted" style="color:rgba(234,240,255,.6)!important;">• Due 2026-06-15</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStudyMaterialsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-book-open me-2"></i>Upload Study Materials</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.uploadStudyMaterial()"><i class="fa-solid fa-upload me-2"></i>Upload</button>
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.go('studentPerformance')"><i class="fa-solid fa-chart-column me-2"></i>Student Performance</button>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-file-arrow-up me-2"></i>Material Upload (Placeholder)</div>
              <div class="small" style="color:rgba(27,42,74,.65)!important; font-weight:700;">Connect this to ${API.studyMaterials}</div>
              <div class="mt-3">
                <input class="form-control" type="file" onchange="StaffApp.onMaterialFileSelected(this.files)" />
              </div>
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-6"><input class="form-control" id="materialTitle" placeholder="Material Title" /></div>
                <div class="col-12 col-md-6"><input class="form-control" id="materialClass" placeholder="Class/Section" /></div>
              </div>
              <div class="mt-3"><button class="btn btn-accent rounded-pill" onclick="StaffApp.submitStudyMaterial()"><i class="fa-solid fa-paper-plane me-2"></i>Publish Material</button></div>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <h6 class="glass-title m-0 mb-3"><i class="fa-solid fa-file-lines me-2"></i>Recent Materials (Demo)</h6>
              <div class="d-flex flex-column gap-2">
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">Unit 4 Notes <span class="text-muted" style="color:rgba(234,240,255,.6)!important;">• PDF</span></div>
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">Practice Set <span class="text-muted" style="color:rgba(234,240,255,.6)!important;">• DOCX</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderExamScheduleView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-chalkboard-user me-2"></i>Exam Schedule</h5>
          <span class="badge badge-soft rounded-pill">Demo data</span>
        </div>
        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Midterm</td><td>Class 10 - B</td><td>Programming</td><td>2026-06-09</td><td>10:00 AM</td></tr>
              <tr><td>Practical</td><td>Class 11 - A</td><td>Data Structures</td><td>2026-06-12</td><td>01:30 PM</td></tr>
              <tr><td>Final</td><td>Class 12 - C</td><td>Algorithms</td><td>2026-06-25</td><td>09:00 AM</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTimetableView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-table me-2"></i>View Timetable</h5>
          <button class="btn btn-soft rounded-pill" onclick="StaffApp.go('attendance')"><i class="fa-solid fa-calendar-check me-2"></i>Take Attendance</button>
        </div>
        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead>
              <tr><th>Time</th><th>Subject</th><th>Class</th><th>Room Number</th></tr>
            </thead>
            <tbody>
              ${demo.timetableToday.map(r => `
                <tr><td>${r.time}</td><td>${r.subject}</td><td>${r.classText}</td><td>${r.room}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderStudentProfilesView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-user-group me-2"></i>Student Profiles</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.go('studentRemarks')"><i class="fa-solid fa-pen-to-square me-2"></i>Add Remarks</button>
            <button class="btn btn-accent rounded-pill" onclick="StaffApp.go('studentPerformance')"><i class="fa-solid fa-chart-column me-2"></i>View Progress</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead>
              <tr>
                <th>Name</th><th>Roll Number</th><th>Parent Information</th>
                <th>Attendance</th><th>Marks</th><th>Performance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${demo.studentsTable.map(s => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.rollNo}</td>
                  <td>${s.parent}</td>
                  <td>${s.attendance}</td>
                  <td>${s.marks}</td>
                  <td>${s.performance}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.viewStudentAttendance('${s.id}')">History</button>
                      <button class="btn btn-sm btn-accent rounded-pill" onclick="StaffApp.openStudentProgress('${s.id}')">Progress</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderStudentPerformanceView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-chart-column me-2"></i>Student Performance</h5>
          <span class="badge badge-soft rounded-pill">Chart.js</span>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="fw-bold"><i class="fa-solid fa-chart-line me-2" style="color:rgba(109,94,252,.95)"></i>Student Progress Chart</div>
                <button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.refreshStudentProgressChart()">Refresh</button>
              </div>
              <canvas id="staff-studentProgressChart" height="180"></canvas>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-trophy me-2" style="color:rgba(245,158,11,.95)"></i>Top Metrics (Demo)</div>
              <div class="d-flex flex-column gap-2">
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold">Average Improvement</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">+6.2% vs last term</div>
                </div>
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold">Most Improved Subject</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">Programming</div>
                </div>
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold">Students Needing Support</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">4 students flagged</div>
                </div>
              </div>
              <div class="mt-3"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('classPerformanceReports')"><i class="fa-solid fa-file-lines me-2"></i>Generate Performance Report</button></div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  function renderStudentRemarksView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-pen-to-square me-2"></i>Student Remarks</h5>
          <span class="badge badge-soft rounded-pill">Placeholder</span>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-6">
            <div class="card-glass-light p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-user me-2"></i>Add Remark</div>
              <div id="staff-remarksFormMount"></div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="card-glass p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-clipboard-check me-2"></i>Recent Remarks (Demo)</div>
              <div class="d-flex flex-column gap-2">
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold">Aarav Sharma</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">Consistent attendance; strong fundamentals in Programming.</div>
                </div>
                <div class="p-2" style="border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.03);">
                  <div class="fw-bold">Diya Gupta</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important;">Excellent improvement after Unit 3. Encourage more practice sets.</div>
                </div>
              </div>
              <div class="mt-3"><button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('studentProfiles')"><i class="fa-solid fa-user-group me-2"></i>View Profiles</button></div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  function renderStudentLeaveRequestsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-file-import me-2"></i>Student Leave Requests</h5>
          <span class="badge badge-soft rounded-pill">Recommend / Forward</span>
        </div>
        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead>
              <tr>
                <th>Student Name</th><th>Class</th><th>Reason</th><th>Leave Days</th><th>Recommendation</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${demo.studentLeaveRequests.map(r => `
                <tr>
                  <td><strong>${r.studentName}</strong></td>
                  <td>${r.classText}</td>
                  <td>${r.reason}</td>
                  <td>${r.leaveDays}</td>
                  <td>${r.recommendation}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.recommendLeave('${r.id}','Approved')"><i class="fa-solid fa-check me-2"></i>Recommend</button>
                      <button class="btn btn-sm btn-accent rounded-pill" onclick="StaffApp.forwardLeave('${r.id}')"><i class="fa-solid fa-share me-2"></i>Forward</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAttendanceReportsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-file-lines me-2"></i>Attendance Reports</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.generateAttendanceReport()"><i class="fa-solid fa-file-export me-2"></i>Generate Report</button>
        </div>
        <div class="card-glass-light p-3">
          <div class="fw-bold mb-2"><i class="fa-solid fa-gear me-2"></i>Report Filters (Placeholder)</div>
          <div class="row g-2">
            <div class="col-12 col-md-4"><input class="form-control" type="date" id="attReportFrom" /></div>
            <div class="col-12 col-md-4"><input class="form-control" type="date" id="attReportTo" /></div>
            <div class="col-12 col-md-4"><select class="form-select" id="attReportClass"><option>All Classes</option></select></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMarksReportsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-file-lines me-2"></i>Marks Reports</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.generateMarksReport()"><i class="fa-solid fa-file-export me-2"></i>Generate Report</button>
        </div>
        <div class="card-glass-light p-3">
          <div class="fw-bold mb-2"><i class="fa-solid fa-gear me-2"></i>Report Filters (Placeholder)</div>
          <div class="row g-2">
            <div class="col-12 col-md-6"><select class="form-select" id="marksReportClass"><option>All Classes</option></select></div>
            <div class="col-12 col-md-6"><select class="form-select" id="marksReportExam"><option>All Exams</option></select></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderClassPerformanceReportsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-award me-2"></i>Class Performance Reports</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.generateClassPerformanceReport()"><i class="fa-solid fa-file-export me-2"></i>Generate Report</button>
        </div>
        <div class="card-glass-light p-3">
          <div class="fw-bold mb-2"><i class="fa-solid fa-chart-pie me-2"></i>Class Performance Chart</div>
          <canvas id="staff-classPerformanceChart" height="140"></canvas>
        </div>
      </div>
    `;
  }

  function renderApplyLeaveView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-plane-departure me-2"></i>Apply Leave</h5>
          <span class="badge badge-soft rounded-pill">Placeholder</span>
        </div>
        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-file-pen me-2"></i>Leave Application Form</div>
              <div id="staff-applyLeaveFormMount"></div>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-list-check me-2" style="color:rgba(33,212,253,.95)"></i>Leave Balance</div>
              <div class="d-flex align-items-center justify-content-between">
                <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:800;">Available</div>
                <div class="fw-extrabold" style="font-size:2rem">${demo.metrics.leaveBalance}</div>
              </div>
              <div class="mt-3">
                <button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('leaveHistory')"><i class="fa-solid fa-clock-rotate-left me-2"></i>View Leave History</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLeaveHistoryView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-clock-rotate-left me-2"></i>Leave History</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.go('applyLeave')"><i class="fa-solid fa-plus me-2"></i>Apply New Leave</button>
        </div>
        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead>
              <tr><th>Leave Date</th><th>Reason</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${demo.leaveManagement.myLeaves.map(l => `
                <tr>
                  <td>${new Date(l.date).toLocaleDateString()}</td>
                  <td>${l.reason}</td>
                  <td>
                    <span class="badge ${l.status==='Approved'?'badge-green':(l.status==='Pending'?'badge-amber':'badge-red')} rounded-pill">${l.status}</span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.cancelLeave('${l.date}')" ${l.status!=='Pending'?'disabled':''}>Cancel</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSalaryDetailsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-money-bill-wave me-2"></i>Salary Details</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-soft rounded-pill" onclick="StaffApp.viewSalarySlip()"><i class="fa-regular fa-eye me-2"></i>View Slip</button>
            <button class="btn btn-accent rounded-pill" onclick="StaffApp.downloadSalarySlip()"><i class="fa-solid fa-file-invoice-dollar me-2"></i>Download Slip</button>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="row g-2">
                <div class="col-12 col-md-6">
                  <div class="p-3" style="border:1px solid rgba(27,42,74,.12); border-radius:16px; background:rgba(255,255,255,.65);">
                    <div class="text-muted" style="font-weight:900;">Current Salary</div>
                    <div class="fw-extrabold fs-4">₹ ${formatINR(demo.salary.current)}</div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="p-3" style="border:1px solid rgba(27,42,74,.12); border-radius:16px; background:rgba(255,255,255,.65);">
                    <div class="text-muted" style="font-weight:900;">Net Salary</div>
                    <div class="fw-extrabold fs-4">₹ ${formatINR(demo.salary.net)}</div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="p-3" style="border:1px solid rgba(27,42,74,.12); border-radius:16px; background:rgba(255,255,255,.65);">
                    <div class="text-muted" style="font-weight:900;">Allowances</div>
                    <div class="fw-extrabold fs-4">₹ ${formatINR(demo.salary.allowances)}</div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="p-3" style="border:1px solid rgba(27,42,74,.12); border-radius:16px; background:rgba(255,255,255,.65);">
                    <div class="text-muted" style="font-weight:900;">Deductions</div>
                    <div class="fw-extrabold fs-4">₹ ${formatINR(demo.salary.deductions)}</div>
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <div class="small" style="color:rgba(27,42,74,.65)!important; font-weight:800;">Placeholder: wire salary API at ${API.salary}.</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <h6 class="glass-title m-0 mb-3"><i class="fa-solid fa-download me-2"></i>Salary Actions</h6>
              <button class="btn btn-accent rounded-pill w-100 mb-2" onclick="StaffApp.downloadSalarySlip()"><i class="fa-solid fa-file-invoice-dollar me-2"></i>Download Salary Slip</button>
              <button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.viewSalarySlip()"><i class="fa-regular fa-eye me-2"></i>View Salary Slip</button>
              <div class="mt-3">
                <button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('classReports')"><i class="fa-solid fa-file-lines me-2"></i>Generate Class Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSalaryHistoryView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-clock me-2"></i>Salary History</h5>
          <span class="badge badge-soft rounded-pill">Demo</span>
        </div>
        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead><tr><th>Month</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Slip</th></tr></thead>
            <tbody>
              <tr><td>May 2026</td><td>₹ 48,000</td><td>₹ 3,000</td><td>₹ 45,000</td><td><button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.downloadSalarySlip('2026-05')">Download</button></td></tr>
              <tr><td>Apr 2026</td><td>₹ 48,000</td><td>₹ 2,800</td><td>₹ 45,200</td><td><button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.downloadSalarySlip('2026-04')">Download</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSalarySlipDownloadView(){
    return renderSalaryDetailsView();
  }

  function renderAnnouncementsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-bullhorn me-2"></i>Announcements</h5>
          <button class="btn btn-soft rounded-pill" onclick="StaffApp.markAnnouncementRead()"><i class="fa-solid fa-check me-2"></i>Mark Read</button>
        </div>
        <div class="d-flex flex-column gap-2">
          ${demo.announcements.map(a => `
            <div class="p-3" style="border:1px solid rgba(255,255,255,.10); border-radius:16px; background:rgba(255,255,255,.03);">
              <div class="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div class="fw-extrabold">${a.title}</div>
                  <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:700;">${a.type} • ${new Date(a.date).toLocaleDateString()}</div>
                </div>
                <span class="badge badge-soft rounded-pill">Notice</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderMessagesView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-regular fa-message me-2"></i>Messages</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.openComposeMessage()"><i class="fa-solid fa-pen me-2"></i>Compose</button>
        </div>
        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-inbox me-2"></i>Inbox</div>
              <div class="d-flex flex-column gap-2">
                ${demo.messages.map(m => `
                  <div class="p-2" style="border:1px solid rgba(27,42,74,.12); border-radius:14px; background:rgba(255,255,255,.65);">
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="fw-extrabold">${m.from}</div>
                      <div class="text-muted" style="font-weight:800;">${new Date(m.date).toLocaleDateString()}</div>
                    </div>
                    <div class="text-muted" style="color:rgba(27,42,74,.65)!important; font-weight:700;">${m.preview}</div>
                    <div class="mt-2"><button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.readMessage('${m.from}')">Open</button></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <div class="fw-bold"><i class="fa-solid fa-circle-info me-2" style="color:rgba(33,212,253,.95)"></i>Tip</div>
              <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:800; line-height:1.6;">
                Connect to Messages API (${API.messages}) to load staff communications from Principal/Admin/Coordinator.
              </div>
              <div class="mt-3">
                <button class="btn btn-soft rounded-pill w-100" onclick="StaffApp.go('announcements')"><i class="fa-solid fa-bullhorn me-2"></i>View Announcements</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDocumentsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-folder-open me-2"></i>Documents</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.openDocumentUpload()"><i class="fa-solid fa-upload me-2"></i>Request/Upload</button>
        </div>
        <div class="table-responsive">
          <table class="table table-modern mb-0">
            <thead><tr><th>Document</th><th>Type</th><th>Action</th></tr></thead>
            <tbody>
              ${demo.documents.map(d => `
                <tr>
                  <td><strong>${d.name}</strong></td>
                  <td>${d.type}</td>
                  <td><button class="btn btn-sm btn-soft rounded-pill" onclick="StaffApp.downloadDocument('${d.id}')"><i class="fa-solid fa-download me-2"></i>Download</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderClassReportsView(){
    return `
      <div class="card-glass p-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="glass-title m-0"><i class="fa-solid fa-file-lines me-2"></i>Generate Class Reports</h5>
          <button class="btn btn-accent rounded-pill" onclick="StaffApp.generateClassReports()"><i class="fa-solid fa-file-export me-2"></i>Generate</button>
        </div>

        <div class="row g-3">
          <div class="col-12 col-lg-7">
            <div class="card-glass-light p-3 h-100">
              <div class="fw-bold mb-2"><i class="fa-solid fa-gear me-2"></i>Report Parameters (Placeholder)</div>
              <div class="row g-2">
                <div class="col-12 col-md-6"><select class="form-select" id="cr_class"><option>Class 10 - B</option><option>Class 9 - A</option></select></div>
                <div class="col-12 col-md-3"><input class="form-control" type="date" id="cr_from" /></div>
                <div class="col-12 col-md-3"><input class="form-control" type="date" id="cr_to" /></div>
              </div>
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-6"><select class="form-select" id="cr_type"><option>Attendance Report</option><option>Marks Report</option><option>Performance Report</option></select></div>
                <div class="col-12 col-md-6"><select class="form-select" id="cr_format"><option>PDF</option><option>CSV</option></select></div>
              </div>
              <div class="mt-3 small" style="color:rgba(27,42,74,.65)!important; font-weight:800;">
                Reports API placeholder: ${API.reports}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="card-glass p-3 h-100">
              <div class="fw-bold"><i class="fa-solid fa-sparkles me-2" style="color:rgba(109,94,252,.95)"></i>Charts</div>
              <div class="text-muted" style="color:rgba(234,240,255,.65)!important; font-weight:800; line-height:1.6;">
                Dashboard charts will also update in response to selected class/report filters.
              </div>
              <div class="mt-3">
                <canvas id="staff-classPerformanceChart" height="140"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Form mounts
  function mountAttendanceForm(){
    const mount = document.getElementById('staff-attendanceFormMount');
    if(!mount) return;

    mount.innerHTML = `
      <div class="row g-2">
        <div class="col-12 col-md-6">
          <label class="form-label" style="font-weight:900; color:rgba(27,42,74,.85)!important;">Select Class</label>
          <select class="form-select" id="att_class">
            <option>Class 10 - B</option>
            <option>Class 9 - A</option>
          </select>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" style="font-weight:900; color:rgba(27,42,74,.85)!important;">Date</label>
          <input class="form-control" type="date" id="att_date" value="${new Date().toISOString().slice(0,10)}" />
        </div>
      </div>

      <div class="table-responsive mt-3">
        <table class="table table-modern mb-0">
          <thead><tr><th>Student</th><th>Roll</th><th>Status</th></tr></thead>
          <tbody>
            ${demo.studentsTable.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.rollNo}</td>
                <td>
                  <select class="form-select form-select-sm" id="att_status_${s.id}">
                    <option value="Present" selected>Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function mountMarksForm(){
    const mount = document.getElementById('staff-marksFormMount');
    if(!mount) return;

    mount.innerHTML = `
      <div class="row g-2">
        <div class="col-12 col-md-4"><input class="form-control" id="mk_exam" placeholder="Exam" value="Unit Test 3" /></div>
        <div class="col-12 col-md-4"><input class="form-control" id="mk_class" placeholder="Class" value="Class 10 - B" /></div>
        <div class="col-12 col-md-4"><input class="form-control" id="mk_subject" placeholder="Subject" value="Programming" /></div>
      </div>

      <div class="table-responsive mt-3">
        <table class="table table-modern mb-0">
          <thead><tr><th>Student</th><th>Roll</th><th>Marks (0-100)</th></tr></thead>
          <tbody>
            ${demo.studentsTable.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.rollNo}</td>
                <td>
                  <input class="form-control form-control-sm" type="number" id="mk_${s.id}" min="0" max="100" value="85" />
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function mountApplyLeaveForm(){
    const mount = document.getElementById('staff-applyLeaveFormMount');
    if(!mount) return;

    mount.innerHTML = `
      <form id="staffApplyLeaveForm" class="d-flex flex-column gap-2">
        <div class="row g-2">
          <div class="col-12 col-md-6"><label class="form-label" style="font-weight:900;">From</label><input class="form-control" type="date" id="leave_from" required /></div>
          <div class="col-12 col-md-6"><label class="form-label" style="font-weight:900;">To</label><input class="form-control" type="date" id="leave_to" required /></div>
        </div>
        <div>
          <label class="form-label" style="font-weight:900;">Reason</label>
          <textarea class="form-control" id="leave_reason" rows="3" placeholder="Enter reason" required></textarea>
        </div>
        <div class="row g-2">
          <div class="col-12 col-md-6"><label class="form-label" style="font-weight:900;">Leave Type</label>
            <select class="form-select" id="leave_type" required>
              <option value="Casual">Casual</option>
              <option value="Medical">Medical</option>
              <option value="Sick">Sick</option>
            </select>
          </div>
          <div class="col-12 col-md-6"><label class="form-label" style="font-weight:900;">Contact (placeholder)</label>
            <input class="form-control" id="leave_contact" placeholder="Phone/Email" />
          </div>
        </div>
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-accent rounded-pill flex-grow-1"><i class="fa-solid fa-paper-plane me-2"></i>Submit Leave Request</button>
          <button type="button" class="btn btn-soft rounded-pill" onclick="StaffApp.go('leaveHistory')">Cancel</button>
        </div>
      </form>
    `;
  }

  function mountStudentRemarksForm(){
    const mount = document.getElementById('staff-remarksFormMount');
    if(!mount) return;

    mount.innerHTML = `
      <form id="staffRemarksForm" class="d-flex flex-column gap-2">
        <div>
          <label class="form-label" style="font-weight:900; color:rgba(27,42,74,.85)!important;">Student</label>
          <select class="form-select" id="remark_student" required>
            ${demo.studentsTable.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label" style="font-weight:900; color:rgba(27,42,74,.85)!important;">Remark</label>
          <textarea class="form-control" id="remark_text" rows="4" placeholder="Write a remark" required></textarea>
        </div>
        <div class="row g-2">
          <div class="col-12 col-md-6"><label class="form-label" style="font-weight:900; color:rgba(27,42,74,.85)!important;">Category</label>
            <select class="form-select" id="remark_category">
              <option value="Academic" selected>Academic</option>
              <option value="Attendance">Attendance</option>
              <option value="Behavior">Behavior</option>
            </select>
          </div>
          <div class="col-12 col-md-6"><label class="form-label" style="font-weight:900; color:rgba(27,42,74,.85)!important;">Visible To</label>
            <select class="form-select" id="remark_visibility">
              <option value="Parent" selected>Parent</option>
              <option value="Student">Student</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-accent rounded-pill flex-grow-1"><i class="fa-solid fa-check me-2"></i>Save Remark</button>
          <button type="button" class="btn btn-soft rounded-pill" onclick="StaffApp.go('studentProfiles')">Close</button>
        </div>
      </form>
    `;
  }

  // Bind event handlers (mounts + actions)
  function bindAttendanceForm(){
    // Called from renderAttendanceView
    mountAttendanceForm();
  }

  function bindMarksForm(){
    mountMarksForm();
  }

  function bindApplyLeaveForm(){
    // Called from renderApplyLeaveView
    mountApplyLeaveForm();
  }

  function bindStudentRemarksForm(){
    mountStudentRemarksForm();
  }

  function bindQuickActions(){
    // Nothing required; buttons use inline onclick to StaffApp methods
  }

  // Chart rendering
  function renderAttendanceCircle(){
    if(!window.Chart) return;
    const id = 'staff-attendanceCircle';
    if(!document.getElementById(id)) return;

    if(window.__charts && window.__charts[id] && typeof window.__charts[id].destroy==='function'){
      window.__charts[id].destroy();
    }

    const pct = demo.attendanceOverview.percentage;
    const absentOrLeave = Math.max(0, 100 - pct);

    window.__charts = window.__charts || {};
    const ctx = document.getElementById(id);
    window.__charts[id] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Others'],
        datasets: [{
          data: [pct, absentOrLeave],
          backgroundColor: ['rgba(109,94,252,.95)','rgba(255,255,255,.18)'],
          borderColor: ['rgba(109,94,252,1)','rgba(255,255,255,.18)'],
          borderWidth: 1,
          hoverOffset: 2
        }]
      },
      options: {
        responsive: true,
        cutout: '72%',
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderAttendanceAnalyticsCharts(){
    if(!window.Chart) return;
    const id = 'staff-attendanceAnalytics';
    if(!document.getElementById(id)) return;

    if(window.__charts && window.__charts[id] && typeof window.__charts[id].destroy==='function'){
      window.__charts[id].destroy();
    }

    const d = demo.attendanceAnalyticsMonthly;
    window.__charts = window.__charts || {};
    const ctx = document.getElementById(id);
    window.__charts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Present',
            data: d.present,
            backgroundColor: 'rgba(34,197,94,.35)',
            borderColor: 'rgba(34,197,94,1)',
            borderWidth: 1
          },
          {
            label: 'Absent',
            data: d.absent,
            backgroundColor: 'rgba(239,68,68,.25)',
            borderColor: 'rgba(239,68,68,1)',
            borderWidth: 1
          },
          {
            label: 'Leave',
            data: d.leave,
            backgroundColor: 'rgba(245,158,11,.25)',
            borderColor: 'rgba(245,158,11,1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#374151' } } },
        scales: {
          x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(17,24,39,.05)' } },
          y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(17,24,39,.05)' } }
        }
      }
    });
  }

  function renderClassPerformanceChart(){
    if(!window.Chart) return;
    const id = 'staff-classPerformanceChart';
    if(!document.getElementById(id)) return;

    if(window.__charts && window.__charts[id] && typeof window.__charts[id].destroy==='function'){
      window.__charts[id].destroy();
    }

    const labels = ['Unit 1','Unit 2','Unit 3','Unit 4','Final'];
    const data = [72, 78, 82, 86, 90];

    window.__charts = window.__charts || {};
    window.__charts[id] = new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label:'Class Performance',
          data,
          borderColor:'rgba(33,212,253,1)',
          backgroundColor:'rgba(33,212,253,.12)',
          tension: .35,
          fill: true,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        plugins:{ legend:{ labels:{ color:'#374151' } } },
        scales:{
          x:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } },
          y:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } }
        }
      }
    });
  }

  function renderStudentProgressChart(){
    if(!window.Chart) return;
    const id = 'staff-studentProgressChart';
    if(!document.getElementById(id)) return;

    if(window.__charts && window.__charts[id] && typeof window.__charts[id].destroy==='function'){
      window.__charts[id].destroy();
    }

    const labels = ['Jan','Feb','Mar','Apr','May','Jun'];
    const series = [74, 78, 80, 84, 88, 90];

    window.__charts = window.__charts || {};
    window.__charts[id] = new Chart(document.getElementById(id), {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label:'Progress Score',
          data: series,
          backgroundColor:'rgba(109,94,252,.25)',
          borderColor:'rgba(109,94,252,1)',
          pointBackgroundColor:'rgba(109,94,252,1)'
        }]
      },
      options: {
        responsive: true,
        plugins:{ legend:{ labels:{ color:'#374151' } } },
        scales:{
          r:{
            grid:{ color:'rgba(17,24,39,.05)' },
            angleLines:{ color:'rgba(17,24,39,.05)' },
            pointLabels:{ color:'#6b7280' },
            ticks:{ color:'#6b7280' }
          }
        }
      }
    });
  }

  // Placeholder actions
  function go(view){ renderView(view); }

  function openClassDetails(classId){
    alert('View Class Details (placeholder) for: ' + classId);
  }

  function markAttendance(){
    renderView('attendance');
    // mount
    bindAttendanceForm();
  }

  async function saveAttendance(){
    // Placeholder: gather statuses and call attendance API
    const statuses = {};
    demo.studentsTable.forEach(s => {
      const sel = document.getElementById('att_status_' + s.id);
      statuses[s.id] = sel ? sel.value : 'Present';
    });

    // Placeholder API call
    console.log('Saving attendance:', statuses);
    try{
      await apiCall(API.attendance, { method:'POST', body: JSON.stringify({ statuses }) });
    }catch(e){ /* demo */ }
    alert('Attendance submitted (placeholder).');
  }

  function viewAttendanceDetail(date){
    alert('View attendance detail (placeholder) for ' + date);
  }

  function enterMarks(){
    renderView('marks');
    bindMarksForm();
  }

  async function saveMarks(){
    const payload = {
      exam: document.getElementById('mk_exam')?.value,
      classText: document.getElementById('mk_class')?.value,
      subject: document.getElementById('mk_subject')?.value,
      marksByStudent: {}
    };
    demo.studentsTable.forEach(s => {
      const input = document.getElementById('mk_' + s.id);
      payload.marksByStudent[s.id] = input ? Number(input.value) : 0;
    });

    console.log('Saving marks:', payload);
    try{
      await apiCall(API.marks, { method:'POST', body: JSON.stringify(payload) });
    }catch(e){ /* demo */ }
    alert('Marks submitted (placeholder).');
  }

  function loadMarksDemo(){
    // Re-render marks form with default values
    renderView('marks');
    bindMarksForm();
  }

  function uploadAssignment(){
    renderView('assignments');
  }
  function onAssignmentFileSelected(files){
    console.log('Assignment file selected', files);
  }
  async function submitAssignment(){
    alert('Assignment uploaded (placeholder).');
  }

  function uploadStudyMaterial(){
    renderView('studyMaterials');
  }
  function onMaterialFileSelected(files){
    console.log('Material file selected', files);
  }
  async function submitStudyMaterial(){
    alert('Study material published (placeholder).');
  }

  function applyLeave(){
    renderView('applyLeave');
    mountApplyLeaveForm();
    bindApplyLeaveForm();
  }

  function cancelLeave(date){
    alert('Cancel leave request (placeholder) for: ' + date);
  }

  function recommendLeave(requestId, status){
    alert('Recommend leave request ' + requestId + ' => ' + status);
  }

  function forwardLeave(requestId){
    alert('Forward leave request to principal (placeholder): ' + requestId);
  }

  function viewSalarySlip(){
    alert('View salary slip (placeholder)');
  }

  function downloadSalarySlip(month){
    alert('Download salary slip (placeholder) ' + (month ? 'for ' + month : 'current month'));
  }

  function markAnnouncementRead(){
    alert('Mark announcements read (placeholder)');
  }

  function openComposeMessage(){
    alert('Compose message (placeholder)');
  }

  function readMessage(from){
    alert('Open message (placeholder) from ' + from);
  }

  function openDocumentUpload(){
    alert('Request/Upload document (placeholder)');
  }

  function downloadDocument(docId){
    alert('Download document (placeholder): ' + docId);
  }

  function generateAttendanceReport(){
    alert('Generate Attendance Report (placeholder)');
  }

  function generateMarksReport(){
    alert('Generate Marks Report (placeholder)');
  }

  function generateClassPerformanceReport(){
    // ensure chart is rendered
    renderView('classPerformanceReports');
    renderClassPerformanceChart();
  }

  function generateClassReports(){
    alert('Generate Class Reports (placeholder)');
  }

  function refreshStudentProgressChart(){
    renderStudentProgressChart();
  }

  function renderDefaultAttendanceAnalytics(){
    renderAttendanceAnalyticsCharts();
    renderAttendanceCircle();
  }

  // Page events binding for submit forms
  window.addEventListener('submit', (e) => {
    const form = e.target;
    if(!form || !form.id) return;
    // Apply leave
    if(form.id === 'staffApplyLeaveForm'){
      e.preventDefault();
      const from = document.getElementById('leave_from')?.value;
      const to = document.getElementById('leave_to')?.value;
      const reason = document.getElementById('leave_reason')?.value;
      const type = document.getElementById('leave_type')?.value;
      const payload = { from, to, reason, type };
      console.log('Apply leave payload', payload);
      alert('Leave request submitted (placeholder).');
      try{ apiCall(API.leaves, { method:'POST', body: JSON.stringify(payload) }); }catch{}
      renderView('leaveHistory');
    }

    // Remarks
    if(form.id === 'staffRemarksForm'){
      e.preventDefault();
      const studentId = document.getElementById('remark_student')?.value;
      const text = document.getElementById('remark_text')?.value;
      const category = document.getElementById('remark_category')?.value;
      const visibility = document.getElementById('remark_visibility')?.value;
      const payload = { studentId, text, category, visibility };
      console.log('Remark payload', payload);
      alert('Remark saved (placeholder).');
      try{ apiCall('/staff/student-remarks', { method:'POST', body: JSON.stringify(payload) }); }catch{}
      renderView('studentProfiles');
    }
  });

  // Expose to window
  window.StaffApp = {
    renderView,
    go,
    openClassDetails,
    markAttendance,
    saveAttendance,
    viewAttendanceDetail,
    enterMarks,
    saveMarks,
    loadMarksDemo,
    uploadAssignment,
    onAssignmentFileSelected,
    submitAssignment,
    uploadStudyMaterial,
    onMaterialFileSelected,
    submitStudyMaterial,
    applyLeave,
    cancelLeave,
    recommendLeave,
    forwardLeave,
    viewSalarySlip,
    downloadSalarySlip,
    markAnnouncementRead,
    openComposeMessage,
    readMessage,
    openDocumentUpload,
    downloadDocument,
    generateAttendanceReport,
    generateMarksReport,
    generateClassPerformanceReport,
    generateClassReports,
    refreshStudentProgressChart,
    renderDefaultAttendanceAnalytics
  };

  // Keep compatibility with inline handlers referenced by HTML
  window.StaffAppAPI = API;

  // Init on load
  window.addEventListener('DOMContentLoaded', () => {
    init();

    // Mount forms when respective views are loaded
    // (some views call mount explicitly)
    // For attendance/marks, mount happens when buttons are clicked.
  });

})();

