 
const STORAGE_KEYS = {
  STUDENTS: 'enaa_students',
  ATTENDANCE: 'enaa_attendance'
};

 

 
function getAllStudents() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
}

 
function getAllAttendance() {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
}

 

function calculateStatistics() {
  const attendance = getAllAttendance();
  const students = getAllStudents();
  
 
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  const studentStats = {};
  const lateTimesInMinutes = [];
  
  
  students.forEach(student => {
    studentStats[student.id] = {
      student: student,
      absences: 0,
      lates: 0,
      presents: 0
    };
  });
  
 
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

 

function renderStatistics() {
  const stats = calculateStatistics();
  
 
  updateRateCard('.col-md-4:nth-child(1) h2', stats.absentRate, '#ef4444');
  updateRateCard('.col-md-4:nth-child(2) h2', stats.lateRate, '#f59e0b');
  updateRateCard('.col-md-4:nth-child(3) h2', stats.presentRate, '#10b981');
  
 
  renderTopAbsents(stats.topAbsent);
  
 
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
      <td>${item.student.prenom} ${item.student.nom}</td>
      <td class="text-end text-danger">${item.absences}</td>
    `;
    tbody.appendChild(row);
  });
}

function addAdditionalStats(stats) {
 
  if (document.getElementById('additionalStats')) return;
  
  const mainContent = document.querySelector('.main-content');
  const existingCard = document.querySelector('.card.border-0.rounded-4.mb-4');
  
 
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
          <td>${item.student.prenom} ${item.student.nom}</td>
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
  
  
}

 

document.addEventListener('DOMContentLoaded', function() {
   
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
  
 
});

 