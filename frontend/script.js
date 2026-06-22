/* Shared dashboard helpers */
(function(){
  const API_BASE = 'http://localhost:5000/api';

  function getToken(){ return localStorage.getItem('token'); }
  function getUser(){
    try{ return JSON.parse(localStorage.getItem('user')); }catch{ return null; }
  }

  window.DashAPI = {
    apiCall: async function(endpoint, options = {}){
      const token = getToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...options,
      };
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      if(!res.ok){
        if(res.status === 401) window.DashUI.logout();
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      // Some endpoints may return empty body; attempt json
      const contentType = res.headers.get('content-type') || '';
      if(contentType.includes('application/json')) return res.json();
      return res.text();
    }
  };

  window.DashUI = {
    logout(){
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '../index.html';
    },

    ensureRole(expectedRole){
      const token = getToken();
      const user = getUser();
      if(!token || !user || user.role !== expectedRole){
        window.location.href = '../index.html';
      }
    },

    setActiveNav(id){
      document.querySelectorAll('[data-nav]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-nav') === id);
      });
    },

    sidebarToggle(){
      const sidebar = document.getElementById('sidebar');
      if(!sidebar) return;
      sidebar.classList.toggle('sidebar-collapsed');
      const persisted = sidebar.classList.contains('sidebar-collapsed');
      try{ localStorage.setItem('sidebar-collapsed', String(persisted)); }catch{}
    },

    hydrateSidebarCollapse(){
      const sidebar = document.getElementById('sidebar');
      if(!sidebar) return;
      try{
        const v = localStorage.getItem('sidebar-collapsed');
        // Only hydrate if user explicitly saved a collapsed state.
        // If value is missing/invalid, do NOT force collapse.
        if(v === 'true') sidebar.classList.add('sidebar-collapsed');
        else sidebar.classList.remove('sidebar-collapsed');
      }catch{}
    }
  };

  // Placeholder router
  window.AppViews = {
    render(viewName){
      DashUI.setActiveNav(viewName);
      const root = document.getElementById('mainContent');
      if(!root) return;

      const placeholders = {
        dashboard: {
          title: 'Dashboard',
          body: `
            <div class="card-glass-light">
              <div class="p-4">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="fa-solid fa-gauge-high"></i>
                  <h5 class="glass-title m-0">Enterprise Overview</h5>
                </div>
                <p class="mb-0" style="color:#4b5563">This is a modern UI layout. Analytics and tables are populated with demo data and safe placeholders. Student/Staff actions are wired to existing backend endpoints.</p>
              </div>
            </div>
          `
        },
        studentManagement: {
          title: 'Student Management',
          body: `<div class="card-glass-light"><div class="p-4">
            <h5 class="glass-title"><i class="fa-solid fa-graduation-cap me-2"></i>Student Management</h5>
            <p class="mb-0" style="color:#4b5563">Use Quick Action “Add Student” to create students. Other links are placeholders.</p>
          </div></div>`
        },
        staffManagement: {
          title: 'Staff Management',
          body: `<div class="card-glass-light"><div class="p-4">
            <h5 class="glass-title"><i class="fa-solid fa-user-tie me-2"></i>Staff Management</h5>
            <p class="mb-0" style="color:#4b5563">Use Quick Action “Add Staff” to create staff accounts. Other links are placeholders.</p>
          </div></div>`
        },
      };

      const view = placeholders[viewName] || placeholders.dashboard;
      root.innerHTML = view.body;
    }
  };

  // Charts helper (Chart.js should be loaded by page)
  window.DashCharts = {
    destroyChart(id){
      if(!window.__charts) window.__charts = {};
      const c = window.__charts[id];
      if(c && typeof c.destroy === 'function') c.destroy();
      delete window.__charts[id];
    },
    initCharts(){
      if(!window.Chart) return;

      const mk = (id, type, data, options) => {
        DashCharts.destroyChart(id);
        const ctx = document.getElementById(id);
        if(!ctx) return;
        window.__charts = window.__charts || {};
        window.__charts[id] = new Chart(ctx, { type, data, options });
      };

      mk('chart-student-growth','line',{
        labels:['Jan','Feb','Mar','Apr','May','Jun'],
        datasets:[{
          label:'Student Growth',
          data:[120,160,190,240,310,360],
          borderColor:'rgba(109,94,252,1)',
          backgroundColor:'rgba(109,94,252,.15)',
          tension:.35,
          fill:true,
          pointRadius:3
        }]
      },{
        responsive:true,
        plugins:{ legend:{ labels:{ color:'#374151' } } },
        scales:{
          x:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } },
          y:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } }
        }
      });

      mk('chart-attendance','bar',{
        labels:['Mon','Tue','Wed','Thu','Fri','Sat'],
        datasets:[{
          label:'Present',
          data:[180,175,190,200,185,170],
          backgroundColor:'rgba(34,197,94,.35)',
          borderColor:'rgba(34,197,94,1)',
          borderWidth:1,
        },{
          label:'Absent',
          data:[5,8,6,4,7,10],
          backgroundColor:'rgba(239,68,68,.25)',
          borderColor:'rgba(239,68,68,1)',
          borderWidth:1,
        }]
      },{
        responsive:true,
        plugins:{ legend:{ labels:{ color:'#374151' } } },
        scales:{
          x:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } },
          y:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } }
        }
      });

      mk('chart-fees','doughnut',{
        labels:['Collected','Pending'],
        datasets:[{
          data:[420000,180000],
          backgroundColor:['rgba(109,94,252,.65)','rgba(245,158,11,.55)'],
          borderColor:['rgba(109,94,252,1)','rgba(245,158,11,1)']
        }]
      },{
        plugins:{ legend:{ labels:{ color:'#374151' } } }
      });

      mk('chart-admission-trends','line',{
        labels:['2019','2020','2021','2022','2023','2024'],
        datasets:[{
          label:'Admissions',
          data:[520,610,690,780,850,920],
          borderColor:'rgba(33,212,253,1)',
          backgroundColor:'rgba(33,212,253,.12)',
          tension:.35,
          fill:true,
          pointRadius:3
        }]
      },{
        responsive:true,
        plugins:{ legend:{ labels:{ color:'#374151' } } },
        scales:{
          x:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } },
          y:{ ticks:{ color:'#6b7280' }, grid:{ color:'rgba(17,24,39,.05)' } }
        }
      });

      mk('chart-staff-attendance','radar',{
        labels:['Mon','Tue','Wed','Thu','Fri'],
        datasets:[{
          label:'Staff Attendance (%)',
          data:[88,86,90,92,89],
          backgroundColor:'rgba(109,94,252,.25)',
          borderColor:'rgba(109,94,252,1)',
          pointBackgroundColor:'rgba(109,94,252,1)'
        }]
      },{
        responsive:true,
        plugins:{ legend:{ labels:{ color:'#374151' } } },
        scales:{
          r:{
            grid:{ color:'rgba(17,24,39,.05)' },
            angleLines:{ color:'rgba(17,24,39,.05)' },
            pointLabels:{ color:'#6b7280' },
            ticks:{ color:'#6b7280' }
          }
        }
      });
    }
  };
})();

