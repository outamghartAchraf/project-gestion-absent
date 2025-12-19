// ============================================
// DATA STRUCTURE & STORAGE UTILITIES
// ============================================

const StorageKeys = {
  STUDENTS: 'enaa_students',
  ATTENDANCE: 'enaa_attendance'
};

// Get data from localStorage
function getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save data to localStorage
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize storage with sample data if empty
function initializeStorage() {
  if (!getFromStorage(StorageKeys.STUDENTS)) {
    const sampleStudents = [
      { id: 1, firstName: 'Mouad', lastName: 'CHARADI', group: 'Groupe 4' },
      { id: 2, firstName: 'Fathi', lastName: 'LAGHRES', group: 'Groupe 4' },
      { id: 3, firstName: 'Zakaria', lastName: 'OUTLA', group: 'Groupe 3' },
      { id: 4, firstName: 'Soufiane', lastName: 'HAJJI', group: 'Groupe 3' }
    ];
    saveToStorage(StorageKeys.STUDENTS, sampleStudents);
  }

  if (!getFromStorage(StorageKeys.ATTENDANCE)) {
    saveToStorage(StorageKeys.ATTENDANCE, []);
  }
}

// ============================================
// STUDENT MANAGEMENT (student.html)
// ============================================

function getAllStudents() {
  return getFromStorage(StorageKeys.STUDENTS) || [];
}

function getStudentById(id) {
  const students = getAllStudents();
  return students.find(s => s.id === parseInt(id));
}

function addStudent(firstName, lastName, group) {
  const students = getAllStudents();
  const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
  
  const newStudent = {
    id: newId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    group: group.trim()
  };
  
  students.push(newStudent);
  saveToStorage(StorageKeys.STUDENTS, students);
  return newStudent;
}

function updateStudent(id, firstName, lastName, group) {
  const students = getAllStudents();
  const index = students.findIndex(s => s.id === parseInt(id));
  
  if (index !== -1) {
    students[index] = {
      id: parseInt(id),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      group: group.trim()
    };
    saveToStorage(StorageKeys.STUDENTS, students);
    return true;
  }
  return false;
}

function deleteStudent(id) {
  let students = getAllStudents();
  students = students.filter(s => s.id !== parseInt(id));
  saveToStorage(StorageKeys.STUDENTS, students);
  
  // Also remove from attendance records
  const attendance = getAllAttendance();
  attendance.forEach(record => {
    record.students = record.students.filter(s => s.studentId !== parseInt(id));
  });
  saveToStorage(StorageKeys.ATTENDANCE, attendance);
}

function renderStudentsList() {
  const students = getAllStudents();
  const container = document.getElementById('studentsContainer');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  students.forEach(student => {
    const card = document.createElement('div');
    card.className = 'card mb-3 student-card';
    card.innerHTML = `
      <div class="card-body d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="student-avatar" style="background-color: ${getRandomColor()};">
            ${getInitials(student.firstName, student.lastName)}
          </div>
          <div>
            <div class="fw-semibold">${student.firstName} ${student.lastName}</div>
            <small class="text-secondary">${student.group} - ID #${String(student.id).padStart(3, '0')}</small>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-warning" onclick="editStudent(${student.id})">
            <i class="bi bi-pencil"></i> Modifier
          </button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteStudent(${student.id})">
            <i class="bi bi-trash"></i> Supprimer
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function showAddStudentModal() {
  document.getElementById('studentModalLabel').textContent = 'Ajouter un apprenant';
  document.getElementById('studentId').value = '';
  document.getElementById('studentFirstName').value = '';
  document.getElementById('studentLastName').value = '';
  document.getElementById('studentGroup').value = '';
  
  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
}

function editStudent(id) {
  const student = getStudentById(id);
  if (!student) return;
  
  document.getElementById('studentModalLabel').textContent = 'Modifier un apprenant';
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentFirstName').value = student.firstName;
  document.getElementById('studentLastName').value = student.lastName;
  document.getElementById('studentGroup').value = student.group;
  
  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
}

function saveStudent() {
  const id = document.getElementById('studentId').value;
  const firstName = document.getElementById('studentFirstName').value;
  const lastName = document.getElementById('studentLastName').value;
  const group = document.getElementById('studentGroup').value;
  
  if (!firstName || !lastName || !group) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  if (id) {
    updateStudent(id, firstName, lastName, group);
  } else {
    addStudent(firstName, lastName, group);
  }
  
  renderStudentsList();
  bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
}

function confirmDeleteStudent(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet apprenant ?')) {
    deleteStudent(id);
    renderStudentsList();
  }
}

// ============================================
// ATTENDANCE MANAGEMENT (presence.html)
// ============================================

function getAllAttendance() {
  return getFromStorage(StorageKeys.ATTENDANCE) || [];
}

function getAttendanceByDate(date) {
  const attendance = getAllAttendance();
  return attendance.find(a => a.date === date);
}

function saveAttendance(date, studentsStatus) {
  const attendance = getAllAttendance();
  const existingIndex = attendance.findIndex(a => a.date === date);
  
  const record = {
    date: date,
    students: studentsStatus
  };
  
  if (existingIndex !== -1) {
    attendance[existingIndex] = record;
  } else {
    attendance.push(record);
  }
  
  saveToStorage(StorageKeys.ATTENDANCE, attendance);
}

function renderPresenceList() {
  const students = getAllStudents();
  const container = document.getElementById('presenceContainer');
  const dateInput = document.getElementById('attendanceDate');
  
  if (!container || !dateInput) return;
  
  const selectedDate = dateInput.value;
  container.innerHTML = '';
  
  // Load existing attendance for this date
  const existingAttendance = selectedDate ? getAttendanceByDate(selectedDate) : null;
  
  students.forEach(student => {
    const existingStatus = existingAttendance?.students.find(s => s.studentId === student.id);
    
    const card = document.createElement('div');
    card.className = 'student-card';
    card.dataset.studentId = student.id;
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center student-card-content">
        <div class="d-flex align-items-center gap-3">
          <div class="student-avatar" style="background-color: ${getRandomColor()};">
            ${getInitials(student.firstName, student.lastName)}
          </div>
          <div>
            <div class="fw-semibold">${student.firstName} ${student.lastName}</div>
            <small class="text-secondary">${student.group} - ID #${String(student.id).padStart(3, '0')}</small>
          </div>
        </div>
        <div class="status-buttons">
          <button class="btn btn-present ${existingStatus?.status === 'present' ? 'active' : ''}" 
                  onclick="setStatus(${student.id}, 'present')">
            Present
          </button>
          <button class="btn btn-absent ${existingStatus?.status === 'absent' ? 'active' : ''}" 
                  onclick="setStatus(${student.id}, 'absent')">
            Absent
          </button>
          <button class="btn btn-retard ${existingStatus?.status === 'late' ? 'active' : ''}" 
                  onclick="setStatus(${student.id}, 'late')">
            Retard
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
    
    // If late, show late info
    if (existingStatus?.status === 'late') {
      showLateInfo(student.id, existingStatus.arrivalTime, existingStatus.reason);
    }
  });
}

function setStatus(studentId, status) {
  const card = document.querySelector(`[data-student-id="${studentId}"]`);
  const buttons = card.querySelectorAll('.status-buttons button');
  
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (status === 'present') {
    card.querySelector('.btn-present').classList.add('active');
    removeLateInfo(studentId);
  } else if (status === 'absent') {
    card.querySelector('.btn-absent').classList.add('active');
    removeLateInfo(studentId);
  } else if (status === 'late') {
    card.querySelector('.btn-retard').classList.add('active');
    showLateInfo(studentId);
  }
}

function showLateInfo(studentId, arrivalTime = '', reason = '') {
  const card = document.querySelector(`[data-student-id="${studentId}"]`);
  let lateInfo = card.nextElementSibling;
  
  if (lateInfo && lateInfo.classList.contains('late-info')) {
    return; // Already showing
  }
  
  lateInfo = document.createElement('div');
  lateInfo.className = 'late-info';
  lateInfo.dataset.studentId = studentId;
  lateInfo.innerHTML = `
    <h6 class="mb-3"><i class="bi bi-clock-history me-2"></i>Informations du retard</h6>
    <div class="row">
      <div class="col-md-6 mb-3 mb-md-0">
        <label class="form-label">Heure d'arrivée *</label>
        <input type="time" class="form-control late-time" value="${arrivalTime}" required>
      </div>
      <div class="col-md-6">
        <label class="form-label">Motif du retard *</label>
        <input type="text" class="form-control late-reason" value="${reason}"
               placeholder="ex: Transport, Rendez-vous médical" required>
      </div>
    </div>
  `;
  card.after(lateInfo);
}

function removeLateInfo(studentId) {
  const lateInfo = document.querySelector(`.late-info[data-student-id="${studentId}"]`);
  if (lateInfo) {
    lateInfo.remove();
  }
}

function saveAttendanceRecord() {
  const dateInput = document.getElementById('attendanceDate');
  const date = dateInput.value;
  
  if (!date) {
    alert('Veuillez sélectionner une date');
    return;
  }
  
  const students = getAllStudents();
  const studentsStatus = [];
  
  let hasError = false;
  
  students.forEach(student => {
    const card = document.querySelector(`[data-student-id="${student.id}"]`);
    const activeButton = card.querySelector('.status-buttons button.active');
    
    if (!activeButton) {
      alert(`Veuillez sélectionner un statut pour ${student.firstName} ${student.lastName}`);
      hasError = true;
      return;
    }
    
    const status = activeButton.classList.contains('btn-present') ? 'present' :
                   activeButton.classList.contains('btn-absent') ? 'absent' : 'late';
    
    const record = {
      studentId: student.id,
      status: status
    };
    
    if (status === 'late') {
      const lateInfo = document.querySelector(`.late-info[data-student-id="${student.id}"]`);
      const arrivalTime = lateInfo?.querySelector('.late-time').value;
      const reason = lateInfo?.querySelector('.late-reason').value;
      
      if (!arrivalTime || !reason) {
        alert(`Veuillez remplir les informations de retard pour ${student.firstName} ${student.lastName}`);
        hasError = true;
        return;
      }
      
      record.arrivalTime = arrivalTime;
      record.reason = reason;
    }
    
    studentsStatus.push(record);
  });
  
  if (hasError) return;
  
  saveAttendance(date, studentsStatus);
  alert('Présence enregistrée avec succès !');
}

// ============================================
// HISTORY PAGE (history.html)
// ============================================

function renderHistoryList() {
  const attendance = getAllAttendance();
  const container = document.getElementById('historyContainer');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  // Sort by date (most recent first)
  attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  attendance.forEach(record => {
    const stats = calculateDayStats(record);
    const formattedDate = formatDate(record.date);
    
    const card = document.createElement('div');
    card.className = 'rounded-4 p-3 mb-3';
    card.style.background = 'linear-gradient(135deg,#0b122f,#101a45)';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center history-card-header">
        <div>
          <div class="fw-semibold">
            <i class="bi bi-calendar me-2"></i>${formattedDate}
          </div>
          <small class="text-secondary">
            ${stats.absent} Absent${stats.absent > 1 ? 's' : ''} · 
            ${stats.late} Retard${stats.late > 1 ? 's' : ''} · 
            ${stats.present} Présent${stats.present > 1 ? 's' : ''}
          </small>
        </div>
        <button class="btn btn-sm text-white" 
                style="background:#7c5cff;border-radius:20px"
                onclick="showDayDetails('${record.date}')">
          <i class="bi bi-eye me-1"></i>Voir détails
        </button>
      </div>
    `;
    container.appendChild(card);
  });
  
  if (attendance.length === 0) {
    container.innerHTML = '<p class="text-center text-secondary">Aucun historique disponible</p>';
  }
}

function showDayDetails(date) {
  const record = getAttendanceByDate(date);
  const students = getAllStudents();
  const detailsContainer = document.getElementById('dayDetails');
  
  if (!detailsContainer || !record) return;
  
  const formattedDate = formatDate(date);
  
  detailsContainer.innerHTML = `
    <h6 class="fw-semibold mb-3">Détails - ${formattedDate}</h6>
    <hr class="border-light opacity-25">
  `;
  
  // Absents
  const absents = record.students.filter(s => s.status === 'absent');
  if (absents.length > 0) {
    const absentSection = document.createElement('div');
    absentSection.innerHTML = `<p class="text-danger fw-semibold">Absents (${absents.length})</p>`;
    
    absents.forEach(absent => {
      const student = students.find(s => s.id === absent.studentId);
      if (student) {
        absentSection.innerHTML += createStudentDetailCard(student, 'Absent', 'danger');
      }
    });
    
    detailsContainer.appendChild(absentSection);
  }
  
  // Late
  const lates = record.students.filter(s => s.status === 'late');
  if (lates.length > 0) {
    const lateSection = document.createElement('div');
    lateSection.className = 'mt-4';
    lateSection.innerHTML = `<p class="text-warning fw-semibold">Retards (${lates.length})</p>`;
    
    lates.forEach(late => {
      const student = students.find(s => s.id === late.studentId);
      if (student) {
        lateSection.innerHTML += createStudentDetailCard(
          student, 
          `Retard - ${late.arrivalTime}<br><small>Motif: ${late.reason}</small>`, 
          'warning'
        );
      }
    });
    
    detailsContainer.appendChild(lateSection);
  }
  
  // Present
  const presents = record.students.filter(s => s.status === 'present');
  if (presents.length > 0) {
    const presentSection = document.createElement('div');
    presentSection.className = 'mt-4';
    presentSection.innerHTML = `<p class="text-success fw-semibold">Présents (${presents.length})</p>`;
    
    presents.forEach(present => {
      const student = students.find(s => s.id === present.studentId);
      if (student) {
        presentSection.innerHTML += createStudentDetailCard(student, 'Présent', 'success');
      }
    });
    
    detailsContainer.appendChild(presentSection);
  }
}

function createStudentDetailCard(student, statusText, statusColor) {
  return `
    <div class="rounded-4 p-3 mb-3 d-flex justify-content-between align-items-center student-card"
         style="background:linear-gradient(135deg,#0b122f,#101a45)">
      <div class="d-flex align-items-center gap-3">
        <div class="rounded-circle d-flex justify-content-center align-items-center fw-bold"
             style="width:42px;height:42px;background:${getRandomColor()}">
          ${getInitials(student.firstName, student.lastName)}
        </div>
        <div>
          <div class="fw-semibold">${student.firstName} ${student.lastName}</div>
          <small class="text-secondary">${student.group} · ID: #${String(student.id).padStart(3, '0')}</small>
        </div>
      </div>
      <span class="badge rounded-pill bg-${statusColor} px-3">${statusText}</span>
    </div>
  `;
}

function searchHistory(searchTerm) {
  const attendance = getAllAttendance();
  const students = getAllStudents();
  const container = document.getElementById('historyContainer');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  const filtered = attendance.filter(record => {
    const formattedDate = formatDate(record.date);
    if (formattedDate.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    
    // Search in student names
    return record.students.some(s => {
      const student = students.find(st => st.id === s.studentId);
      return student && 
             (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  });
  
  filtered.forEach(record => {
    const stats = calculateDayStats(record);
    const formattedDate = formatDate(record.date);
    
    const card = document.createElement('div');
    card.className = 'rounded-4 p-3 mb-3';
    card.style.background = 'linear-gradient(135deg,#0b122f,#101a45)';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center history-card-header">
        <div>
          <div class="fw-semibold">
            <i class="bi bi-calendar me-2"></i>${formattedDate}
          </div>
          <small class="text-secondary">
            ${stats.absent} Absent · ${stats.late} Retard · ${stats.present} Présent
          </small>
        </div>
        <button class="btn btn-sm text-white" 
                style="background:#7c5cff;border-radius:20px"
                onclick="showDayDetails('${record.date}')">
          <i class="bi bi-eye me-1"></i>Voir détails
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ============================================
// STATISTICS PAGE (statistics.html / index.html)
// ============================================

function calculateStatistics() {
  const attendance = getAllAttendance();
  const students = getAllStudents();
  
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
  
  // Calculate stats
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
  
  // Update rates
  const absentRateEl = document.getElementById('absentRate');
  const lateRateEl = document.getElementById('lateRate');
  const presentRateEl = document.getElementById('presentRate');
  
  if (absentRateEl) absentRateEl.textContent = `${stats.absentRate}%`;
  if (lateRateEl) lateRateEl.textContent = `${stats.lateRate}%`;
  if (presentRateEl) presentRateEl.textContent = `${stats.presentRate}%`;
  
  // Update top absents
  const topAbsentContainer = document.getElementById('topAbsent');
  if (topAbsentContainer) {
    const tbody = topAbsentContainer.querySelector('tbody');
    tbody.innerHTML = '';
    
    stats.topAbsent.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.student.firstName} ${item.student.lastName}</td>
        <td class="text-end text-danger">${item.absences}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // Update top lates
  const topLateContainer = document.getElementById('topLate');
  if (topLateContainer) {
    const tbody = topLateContainer.querySelector('tbody');
    tbody.innerHTML = '';
    
    stats.topLate.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.student.firstName} ${item.student.lastName}</td>
        <td class="text-end text-warning">${item.lates}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // Update average late time
  const avgLateTimeEl = document.getElementById('avgLateTime');
  if (avgLateTimeEl) {
    avgLateTimeEl.textContent = stats.averageLateTime;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getInitials(firstName, lastName) {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

function getRandomColor() {
  const colors = ['#6b7280', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function calculateDayStats(record) {
  const present = record.students.filter(s => s.status === 'present').length;
  const absent = record.students.filter(s => s.status === 'absent').length;
  const late = record.students.filter(s => s.status === 'late').length;
  
  return { present, absent, late };
}

function setTodayDate() {
  const dateInput = document.getElementById('attendanceDate');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  initializeStorage();
  
  // Detect current page and render accordingly
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('student.html')) {
    renderStudentsList();
  } else if (currentPage.includes('presence.html')) {
    setTodayDate();
    renderPresenceList();
    
    // Re-render when date changes
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
      dateInput.addEventListener('change', renderPresenceList);
    }
  } else if (currentPage.includes('history.html')) {
    renderHistoryList();
    
    // Search functionality
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
          renderHistoryList();
        } else {
          searchHistory(e.target.value);
        }
      });
    }
  } else if (currentPage.includes('index.html') || currentPage === '/') {
    renderStatistics();
  }
  
  // Sidebar menu toggle for mobile
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
});