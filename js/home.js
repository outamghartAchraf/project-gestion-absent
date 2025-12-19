// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  STUDENTS: 'enaa_students',
  ATTENDANCE: 'enaa_attendance'
};

// ============================================
// DATA MANAGEMENT
// ============================================

// Get students from localStorage
function getAllStudents() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
}

// Get attendance records
function getAllAttendance() {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
}

// ============================================
// STATISTICS CALCULATION
// ============================================

function calculateStatistics() {
  const attendance = getAllAttendance();
  const students = getAllStudents();
  
  // Initialize counters
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  const studentStats = {};
  const lateTimesInMinutes = [];
  
  // Initialize student stats
  students.forEach(student => {
    studentStats[student.id] = {
      student: student,
      absences: 0,
      lates: 0,
      presents: 0
    };
  });
  
  // Calculate stats from attendance records
  attendance.forEach(record => {
    record.students.forEach(s => {
      if (s.status === 'present') {
        totalPresent++;
        if (studentStats[s.studentId]) studentStats[s.studentId].presents++;
      } else if (s.status === 'absent') {
        totalAbsent++;
        if (studentStats[s.studentId]) studentStats[s.studentId].absences++;
      } else if (s.status === 'late') {
        totalLate++;
        if (studentStats[s.studentId]) studentStats[s.studentId].lates++;
        
        // Convert arrival time to minutes for average calculation
        if (s.arrivalTime) {
          const [hours, minutes] = s.arrivalTime.split(':').map(Number);
          lateTimesInMinutes.push(hours * 60 + minutes);
        }
      }
    });
  });
  
  const total = totalPresent + totalAbsent + totalLate;
  
  return {
    absentRate: total > 0 ? ((totalAbsent / total) * 100).toFixed(1) : 0,
    lateRate: total > 0 ? ((totalLate / total) * 100).toFixed(1) : 0,
    presentRate: total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0,
    totalPresent,
    totalAbsent,
    totalLate,
    total,
    topAbsent: Object.values(studentStats)
      .sort((a, b) => b.absences - a.absences)
      .slice(0, 3),
    topLate: Object.values(studentStats)
      .sort((a, b) => b.lates - a.lates)
      .slice(0, 3),
    averageLateTime: calculateAverageLateTime(lateTimesInMinutes)
  };
}

function calculateAverageLateTime(timesInMinutes) {
  if (timesInMinutes.length === 0) return 'N/A';
  
  const avg = timesInMinutes.reduce((sum, time) => sum + time, 0) / timesInMinutes.length;
  const hours = Math.floor(avg / 60);
  const minutes = Math.round(avg % 60);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ============================================
// RENDER STATISTICS
// ============================================

function renderStatistics() {
  const stats = calculateStatistics();
  
  // Update rate cards
  updateRateCard('.col-md-4:nth-child(1) h2', stats.absentRate, '#ef4444');
  updateRateCard('.col-md-4:nth-child(2) h2', stats.lateRate, '#f59e0b');
  updateRateCard('.col-md-4:nth-child(3) h2', stats.presentRate, '#10b981');
  
  // Update top absents table
  renderTopAbsents(stats.topAbsent);
  
  // Check if we should add more statistics sections
  addAdditionalStats(stats);
}

function updateRateCard(selector, rate, color) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = `${rate}%`;
    element.style.color = color;
  }
}

function renderTopAbsents(topAbsent) {
  const tbody = document.querySelector('.table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (topAbsent.length === 0 || topAbsent[0].absences === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="3" class="text-center text-secondary">
        Aucune absence enregistrée
      </td>
    `;
    tbody.appendChild(row);
    return;
  }
  
  topAbsent.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.student.firstName} ${item.student.lastName}</td>
      <td class="text-end text-danger">${item.absences}</td>
    `;
    tbody.appendChild(row);
  });
}

function addAdditionalStats(stats) {
  // Check if additional stats section already exists
  if (document.getElementById('additionalStats')) return;
  
  const mainContent = document.querySelector('.main-content');
  const existingCard = document.querySelector('.card.border-0.rounded-4.mb-4');
  
  // Create Top Late Students section
  const topLateSection = document.createElement('div');
  topLateSection.id = 'additionalStats';
  topLateSection.className = 'card border-0 rounded-4 mb-4';
  topLateSection.style.background = '#1e3a5f';
  
  let topLateHTML = `
    <div class="card-body">
      <h5 class="text-white mb-3">
        <i class="fas fa-clock me-2"></i> Top 3 - Plus en retard
      </h5>
      <div class="table-responsive">
        <table class="table table-dark mb-0">
          <thead style="background:#0a1929;">
            <tr>
              <th>Rang</th>
              <th>Étudiant</th>
              <th class="text-end">Retards</th>
            </tr>
          </thead>
          <tbody style="background:#1e3a5f;">
  `;
  
  if (stats.topLate.length === 0 || stats.topLate[0].lates === 0) {
    topLateHTML += `
      <tr>
        <td colspan="3" class="text-center text-secondary">
          Aucun retard enregistré
        </td>
      </tr>
    `;
  } else {
    stats.topLate.forEach((item, index) => {
      topLateHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.student.firstName} ${item.student.lastName}</td>
          <td class="text-end text-warning">${item.lates}</td>
        </tr>
      `;
    });
  }
  
  topLateHTML += `
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  topLateSection.innerHTML = topLateHTML;
  existingCard.after(topLateSection);
  
  // Create additional info card
  const infoSection = document.createElement('div');
  infoSection.className = 'card border-0 rounded-4 mb-4';
  infoSection.style.background = '#1e3a5f';
  infoSection.innerHTML = `
    <div class="card-body">
      <h5 class="text-white mb-3">
        <i class="fas fa-info-circle me-2"></i> Informations supplémentaires
      </h5>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="p-3 rounded" style="background:#0a1929;">
            <p class="text-white-50 mb-1 small">Total des présences</p>
            <h4 class="text-success mb-0">${stats.totalPresent}</h4>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 rounded" style="background:#0a1929;">
            <p class="text-white-50 mb-1 small">Total des absences</p>
            <h4 class="text-danger mb-0">${stats.totalAbsent}</h4>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 rounded" style="background:#0a1929;">
            <p class="text-white-50 mb-1 small">Total des retards</p>
            <h4 class="text-warning mb-0">${stats.totalLate}</h4>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 rounded" style="background:#0a1929;">
            <p class="text-white-50 mb-1 small">Heure moyenne d'arrivée (retards)</p>
            <h4 class="text-info mb-0">${stats.averageLateTime}</h4>
          </div>
        </div>
      </div>
    </div>
  `;
  
  topLateSection.after(infoSection);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Render statistics
  renderStatistics();
  
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (menuToggle && sidebar && sidebarOverlay) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      sidebarOverlay.classList.toggle('show');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      sidebarOverlay.classList.remove('show');
    });

    // Close sidebar when clicking on a link (mobile only)
    if (window.innerWidth <= 768) {
      const navLinks = sidebar.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          sidebar.classList.remove('show');
          sidebarOverlay.classList.remove('show');
        });
      });
    }
  }
  
  // Add refresh button
  addRefreshButton();
});

// ============================================
// REFRESH FUNCTIONALITY
// ============================================

function addRefreshButton() {
  const header = document.querySelector('h1');
  if (!header || document.getElementById('refreshBtn')) return;
  
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'refreshBtn';
  refreshBtn.className = 'btn btn-sm btn-outline-primary ms-3';
  refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Actualiser';
  refreshBtn.style.cssText = 'vertical-align: middle;';
  
  refreshBtn.addEventListener('click', () => {
    // Add rotation animation
    const icon = refreshBtn.querySelector('i');
    icon.style.animation = 'spin 1s linear';
    
    // Remove additional stats to recreate them
    const additionalStats = document.getElementById('additionalStats');
    if (additionalStats) {
      additionalStats.remove();
      additionalStats.nextElementSibling?.remove();
    }
    
    // Re-render statistics
    renderStatistics();
    
    // Remove animation after 1 second
    setTimeout(() => {
      icon.style.animation = '';
    }, 1000);
  });
  
  header.appendChild(refreshBtn);
  
  // Add CSS for spin animation
  if (!document.getElementById('spinAnimation')) {
    const style = document.createElement('style');
    style.id = 'spinAnimation';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}