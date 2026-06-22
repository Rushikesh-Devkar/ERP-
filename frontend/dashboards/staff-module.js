(function(){
  const MODE = window.STAFF_MODULE_MODE || 'staff';
  const API = window.DashAPI;
  const state = { staff: [], page: 1, pageSize: 8, view: 'table' };
  const teacherLabels = ['teacher','faculty','professor','assistant professor','lab instructor','hod'];

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => esc(value || '-');
  const dateText = value => value ? new Date(value).toLocaleDateString() : '-';
  const money = value => Number(value || 0).toLocaleString('en-IN');
  const idOf = item => item.employeeId || item._id;
  const isTeacher = item => [item.employeeType,item.employeeCategory,item.designation,item.roleAssignment,item.subject].some(value => teacherLabels.some(label => String(value || '').toLowerCase().includes(label)));

  function profileUrl(item){
    return MODE === 'teachers' ? `/teachers/${idOf(item)}` : `/staff/${idOf(item)}`;
  }

  function initials(name){
    return String(name || 'S').split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'S';
  }

  function avatar(item, large=false){
    const cls = large ? 'staff-avatar-lg' : 'staff-avatar';
    return item.profilePhoto ? `<img class="${cls}" src="${esc(item.profilePhoto)}" alt="">` : `<span class="${cls}">${esc(initials(item.fullName || item.userId?.name))}</span>`;
  }

  function statusBadge(status){
    const label = status || 'Active';
    const lower = label.toLowerCase();
    const cls = lower.includes('suspend') ? 'suspended' : lower.includes('leave') ? 'leave' : 'active';
    return `<span class="staff-badge ${cls}"><i class="fa-solid fa-circle"></i>${esc(label)}</span>`;
  }

  async function loadDirectory(){
    renderLoading();
    const endpoint = MODE === 'teachers' ? '/admin/teachers' : '/admin/staff';
    state.staff = await API.apiCall(endpoint);
    await loadStats();
    fillFilters();
    renderDirectory();
  }

  async function loadStats(){
    try{
      const stats = await API.apiCall('/admin/staff/stats');
      const map = {
        totalStaff: 'Total Staff',
        totalTeachers: 'Total Teachers',
        activeStaff: 'Active Staff',
        onLeave: 'On Leave',
        newJoiners: 'New Joiners'
      };
      $('staffStats').innerHTML = Object.entries(map).map(([key,label]) => `
        <div class="col-6 col-lg">
          <div class="staff-stat h-100">
            <div class="staff-stat-value">${esc(stats[key] ?? 0)}</div>
            <div class="staff-muted">${esc(label)}</div>
          </div>
        </div>
      `).join('');
    }catch{
      $('staffStats').innerHTML = '';
    }
  }

  function renderLoading(){
    $('directoryMount').innerHTML = '<div class="staff-shell-panel p-4 staff-muted">Loading records...</div>';
  }

  function fillFilters(){
    const fill = (id, values, label) => {
      const selected = $(id).value;
      $(id).innerHTML = `<option value="">${label}</option>` + [...new Set(values.filter(Boolean))].sort().map(value => `<option ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join('');
    };
    fill('departmentFilter', state.staff.map(s => s.department), 'All departments');
    fill('designationFilter', state.staff.map(s => s.designation), 'All designations');
    fill('statusFilter', state.staff.map(s => s.status || s.employmentStatus), 'All statuses');
  }

  function filtered(){
    const q = $('staffSearch').value.trim().toLowerCase();
    const department = $('departmentFilter').value;
    const designation = $('designationFilter').value;
    const status = $('statusFilter').value;
    return state.staff.filter(item => {
      const haystack = [item.fullName,item.employeeId,item.department,item.designation,item.officialEmail,item.mobileNumber,item.subject].join(' ').toLowerCase();
      return (!q || haystack.includes(q))
        && (!department || item.department === department)
        && (!designation || item.designation === designation)
        && (!status || (item.status || item.employmentStatus) === status);
    });
  }

  function pageItems(items){
    const totalPages = Math.max(Math.ceil(items.length / state.pageSize), 1);
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.pageSize;
    return { rows: items.slice(start, start + state.pageSize), totalPages };
  }

  function renderDirectory(){
    const items = filtered();
    const { rows, totalPages } = pageItems(items);
    $('recordCount').textContent = `${items.length} records`;
    $('directoryMount').innerHTML = state.view === 'grid' ? renderGrid(rows) : renderTable(rows);
    $('paginationMount').innerHTML = `
      <button class="btn btn-sm btn-soft rounded-pill" ${state.page === 1 ? 'disabled' : ''} data-page="${state.page - 1}"><i class="fa-solid fa-chevron-left"></i></button>
      <span class="staff-muted px-2">Page ${state.page} of ${totalPages}</span>
      <button class="btn btn-sm btn-soft rounded-pill" ${state.page === totalPages ? 'disabled' : ''} data-page="${state.page + 1}"><i class="fa-solid fa-chevron-right"></i></button>
    `;
    document.querySelectorAll('[data-page]').forEach(btn => btn.addEventListener('click', () => { state.page = Number(btn.dataset.page); renderDirectory(); }));
    document.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteStaff(btn.dataset.delete)));
    document.querySelectorAll('[data-suspend]').forEach(btn => btn.addEventListener('click', () => suspendStaff(btn.dataset.suspend)));
    document.querySelectorAll('[data-print]').forEach(btn => btn.addEventListener('click', () => window.open(`/staff/${btn.dataset.print}`, '_blank')));
  }

  function renderTable(rows){
    return `
      <div class="staff-shell-panel p-2">
        <div class="table-responsive">
          <table class="table staff-directory-table mb-0">
            <thead><tr><th>Photo</th><th>Employee ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Email</th><th>Phone</th><th>Joining Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${rows.map(row => `
              <tr>
                <td>${avatar(row)}</td>
                <td class="fw-bold">${text(row.employeeId)}</td>
                <td><a class="staff-name-link" href="${profileUrl(row)}">${text(row.fullName || row.userId?.name)}</a></td>
                <td>${text(row.department)}</td>
                <td>${text(row.designation)}</td>
                <td>${text(row.officialEmail || row.userId?.email)}</td>
                <td>${text(row.mobileNumber)}</td>
                <td>${dateText(row.dateOfJoining)}</td>
                <td>${statusBadge(row.status || row.employmentStatus)}</td>
                <td>${actions(row)}</td>
              </tr>
            `).join('') || `<tr><td colspan="10" class="text-center staff-muted py-4">No records found</td></tr>`}</tbody>
          </table>
        </div>
      </div>`;
  }

  function renderGrid(rows){
    return `<div class="row g-3">${rows.map(row => `
      <div class="col-12 col-md-6 col-xl-4">
        <a class="text-decoration-none" href="${profileUrl(row)}">
          <div class="staff-card">
            <div class="d-flex align-items-start gap-3">
              ${avatar(row)}
              <div class="min-w-0 flex-grow-1">
                <div class="staff-name-link">${text(row.fullName || row.userId?.name)}</div>
                <div class="staff-muted">${text(row.employeeId)} · ${text(row.designation)}</div>
                <div class="mt-2">${statusBadge(row.status || row.employmentStatus)}</div>
              </div>
            </div>
            <div class="row g-2 mt-3">
              <div class="col-6"><div class="staff-muted">Department</div><strong>${text(row.department)}</strong></div>
              <div class="col-6"><div class="staff-muted">Subject</div><strong>${text(row.subject)}</strong></div>
              <div class="col-12"><div class="staff-muted">Contact</div><strong>${text(row.officialEmail || row.mobileNumber)}</strong></div>
            </div>
          </div>
        </a>
      </div>
    `).join('') || '<div class="col-12"><div class="staff-shell-panel p-4 text-center staff-muted">No records found</div></div>'}</div>`;
  }

  function actions(row){
    const id = idOf(row);
    return `
      <div class="d-flex gap-1 flex-wrap">
        <a class="btn btn-sm btn-soft staff-action-btn" href="${profileUrl(row)}" title="View Profile"><i class="fa-solid fa-eye"></i></a>
        <a class="btn btn-sm btn-soft staff-action-btn" href="/staff/add?edit=${encodeURIComponent(id)}" title="Edit"><i class="fa-solid fa-pen"></i></a>
        <button class="btn btn-sm btn-soft staff-action-btn" data-delete="${esc(id)}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        <button class="btn btn-sm btn-soft staff-action-btn" data-suspend="${esc(id)}" title="Suspend"><i class="fa-solid fa-user-slash"></i></button>
        <button class="btn btn-sm btn-soft staff-action-btn" data-print="${esc(id)}" title="Print"><i class="fa-solid fa-print"></i></button>
      </div>`;
  }

  async function deleteStaff(id){
    if(!confirm(`Delete staff ${id}?`)) return;
    await API.apiCall(`/admin/staff/${encodeURIComponent(id)}`, { method:'DELETE' });
    state.staff = state.staff.filter(item => idOf(item) !== id);
    await loadStats();
    renderDirectory();
  }

  async function suspendStaff(id){
    await API.apiCall(`/admin/staff/${encodeURIComponent(id)}/suspend`, { method:'PATCH' });
    await loadDirectory();
  }

  function exportCsv(){
    const headers = ['Employee ID','Name','Department','Designation','Email','Phone','Joining Date','Status'];
    const lines = [headers, ...filtered().map(item => [
      item.employeeId,
      item.fullName,
      item.department,
      item.designation,
      item.officialEmail || item.userId?.email,
      item.mobileNumber,
      dateText(item.dateOfJoining),
      item.status || item.employmentStatus
    ])].map(row => row.map(cell => `"${String(cell || '').replace(/"/g,'""')}"`).join(','));
    const blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = MODE === 'teachers' ? 'teachers.csv' : 'staff-directory.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function loadProfile(){
    const id = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
    const item = await API.apiCall(`/admin/staff/${encodeURIComponent(id)}`);
    renderProfile(item);
  }

  function kv(label, value){ return `<div class="profile-kv"><div class="profile-key">${esc(label)}</div><div class="profile-value">${text(value)}</div></div>`; }

  function renderProfile(item){
    const title = MODE === 'teacherProfile' ? 'Teacher Profile' : 'Staff Profile';
    $('profileMount').innerHTML = `
      <div class="staff-shell-panel p-3 p-md-4 mb-3">
        <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div class="d-flex align-items-center gap-3">
            ${avatar(item, true)}
            <div>
              <h3 class="staff-page-title mb-1">${text(item.fullName || item.userId?.name)}</h3>
              <div class="staff-muted">${text(item.employeeId)} · ${text(item.designation)} · ${text(item.department)}</div>
              <div class="mt-2">${statusBadge(item.status || item.employmentStatus)}</div>
            </div>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <a class="btn btn-soft rounded-pill" href="/staff/add?edit=${encodeURIComponent(idOf(item))}"><i class="fa-solid fa-pen me-2"></i>Edit</a>
            <button class="btn btn-soft rounded-pill" onclick="window.print()"><i class="fa-solid fa-print me-2"></i>Print</button>
            <button class="btn btn-soft rounded-pill" onclick="window.print()"><i class="fa-solid fa-file-pdf me-2"></i>Download PDF</button>
            <button class="btn btn-danger rounded-pill" id="profileDeleteBtn"><i class="fa-solid fa-trash me-2"></i>Delete</button>
          </div>
        </div>
      </div>
      <div class="staff-shell-panel p-3">
        <ul class="nav staff-tabs gap-2 mb-3" id="profileTabs">
          ${['Personal','Contact','Address','Employment','Qualification','Experience','Payroll','Documents'].map((name,index)=>`<li class="nav-item"><button class="nav-link ${index?'':'active'}" data-tab="${index}">${name}</button></li>`).join('')}
        </ul>
        <div id="profileTabMount"></div>
      </div>`;

    const tabs = [
      [kv('Full Name', item.fullName), kv('DOB', dateText(item.dateOfBirth)), kv('Gender', item.gender), kv('Blood Group', item.bloodGroup), kv('Nationality', item.nationality), kv('Marital Status', item.maritalStatus), kv('Aadhaar', item.aadhaarNumber), kv('PAN', item.panNumber)],
      [kv('Mobile', item.mobileNumber), kv('Alternate Mobile', item.alternateMobileNumber), kv('Email', item.officialEmail || item.userId?.email), kv('Emergency Contact', [item.emergencyContactName,item.emergencyContactNumber].filter(Boolean).join(' - '))],
      [kv('Current Address', item.currentAddress), kv('Permanent Address', item.permanentAddress), kv('City', item.city), kv('State', item.state), kv('Country', item.country), kv('PIN Code', item.pinCode)],
      [kv('Joining Date', dateText(item.dateOfJoining)), kv('Employee Type', item.employeeType), kv('Department', item.department), kv('Designation', item.designation), kv('Reporting Manager', item.reportingManager), kv('Branch', item.workLocation), kv('Shift', item.shiftTiming)],
      [kv('Degrees', item.degreeName), kv('University', item.universityBoard), kv('Year', item.passingYear), kv('CGPA', item.percentageCgpa), kv('Certificates', docValue(item, 'upload_certificates') || docValue(item, 'educational_certificates'))],
      [kv('Previous Companies', item.previousOrganization), kv('Experience Years', item.totalExperience), kv('Skills', item.skills), kv('Certifications', item.certifications)],
      [kv('Salary', `Rs. ${money(item.salary)}`), kv('PF', item.pfNumber), kv('UAN', item.uanNumber), kv('ESIC', item.esicNumber), kv('Bank Details', [item.bankName,item.accountNumber,item.ifscCode].filter(Boolean).join(' / '))],
      [documentsHtml(item)]
    ];

    function showTab(index){
      $('profileTabMount').innerHTML = index === 7 ? tabs[index].join('') : `<div class="profile-grid">${tabs[index].join('')}</div>`;
      document.querySelectorAll('[data-tab]').forEach(btn => btn.classList.toggle('active', Number(btn.dataset.tab) === index));
    }
    document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => showTab(Number(btn.dataset.tab))));
    $('profileDeleteBtn').addEventListener('click', async () => { await deleteStaff(idOf(item)); location.href = '/staff'; });
    document.title = `${title} - ${item.fullName || item.employeeId}`;
    showTab(0);
  }

  function docValue(item, key){
    if(!item.documents) return '';
    return item.documents[key] || (item.documents instanceof Map ? item.documents.get(key) : '');
  }

  function documentsHtml(item){
    const docs = [
      ['Photo','profile_photo'],
      ['Aadhaar','aadhaar_card'],
      ['PAN','pan_card'],
      ['Resume','resume'],
      ['Certificates','educational_certificates'],
      ['Experience Letters','experience_letters']
    ];
    return `<div class="d-flex flex-column gap-2">${docs.map(([label,key]) => {
      const value = docValue(item, key) || (key === 'profile_photo' ? item.profilePhoto : '');
      return `<div class="document-row"><div><strong>${esc(label)}</strong><div class="staff-muted">${esc(value || 'Not uploaded')}</div></div><div class="d-flex gap-2">${value ? `<a class="btn btn-sm btn-soft rounded-pill" href="${esc(value)}" target="_blank">Preview</a><a class="btn btn-sm btn-soft rounded-pill" href="${esc(value)}" download>Download</a>` : '<span class="staff-muted">-</span>'}</div></div>`;
    }).join('')}</div>`;
  }

  function wireDirectory(){
    ['staffSearch','departmentFilter','designationFilter','statusFilter'].forEach(id => $(id).addEventListener('input', () => { state.page = 1; renderDirectory(); }));
    $('tableViewBtn').addEventListener('click', () => { state.view = 'table'; renderDirectory(); });
    $('gridViewBtn').addEventListener('click', () => { state.view = 'grid'; renderDirectory(); });
    $('csvBtn').addEventListener('click', exportCsv);
    $('excelBtn').addEventListener('click', exportCsv);
    loadDirectory().catch(err => $('directoryMount').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(window.DashUI){
      DashUI.ensureRole('admin');
      DashUI.hydrateSidebarCollapse();
    }
    if(MODE === 'profile' || MODE === 'teacherProfile'){
      loadProfile().catch(err => $('profileMount').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`);
    }else{
      wireDirectory();
    }
  });
})();
