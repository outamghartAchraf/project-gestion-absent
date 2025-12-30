
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


function saveAttendance(attendance) {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
}


function getAttendanceByDate(date) {
  const attendance = getAllAttendance();
  return attendance.find(a => a.date === date);
}


function getInitials(prenom, nom) {
  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
}


function getRandomColor() {
  const colors = ['#6b7280', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}


function setTodayDate() {
  const dateInput = document.querySelector('.date-input');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}



function renderPresenceList() {
  const students = getAllStudents();
  const dateInput = document.querySelector('.date-input');
  const main = document.querySelector('main');
  
  if (!dateInput || !main) return;
  
  const selectedDate = dateInput.value;
  
 
  document.querySelectorAll('.student-card, .late-info').forEach(el => el.remove());
  
 
  const existingAttendance = selectedDate ? getAttendanceByDate(selectedDate) : null;
  
  
  const dateContainer = document.querySelector('.date-container').parentElement;
  
  students.forEach(student => {
    const existingStatus = existingAttendance?.students.find(s => s.studentId === student.id);
    
    const card = document.createElement('div');
    card.className = 'student-card';
    card.dataset.studentId = student.id;
    
    const initials = getInitials(student.prenom, student.nom);
    const avatarColor = getRandomColor();
    
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center student-card-content">
        <div class="d-flex align-items-center gap-3">
          <div class="student-avatar" style="background-color: ${avatarColor};">
            ${initials}
          </div>
          <div>
            <div class="fw-semibold">${student.prenom} ${student.nom}</div>
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
    
  
    dateContainer.after(card);
    
  
    if (existingStatus?.status === 'late') {
      showLateInfo(student.id, existingStatus.arrivalTime, existingStatus.reason);
    }
  });
  

  if (!document.querySelector('#active-button-style')) {
    const style = document.createElement('style');
    style.id = 'active-button-style';
    style.textContent = `
      .status-buttons .btn.active {
        opacity: 1;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }
}



function setStatus(studentId, status) {
  const card = document.querySelector(`[data-student-id="${studentId}"]`);
  if (!card) return;
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
  if (!card) return;
   let lateInfo = card.nextElementSibling;
  if (lateInfo && lateInfo.classList.contains('late-info')) {
    return;  
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
  const dateInput = document.querySelector('.date-input');
  const date = dateInput.value;
  
  if (!date) {
    showNotification('Veuillez sélectionner une date', 'danger');
    return;
  }
  
  const students = getAllStudents();
  const studentsStatus = [];
  let hasError = false;
  
  students.forEach(student => {
    const card = document.querySelector(`[data-student-id="${student.id}"]`);
    if (!card) return;
    
    const activeButton = card.querySelector('.status-buttons button.active');
    
    if (!activeButton) {
      showNotification(`Veuillez sélectionner un statut pour ${student.prenom} ${student.nom}`, 'warning');
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
        showNotification(`Veuillez remplir les informations de retard pour ${student.prenom} ${student.nom}`, 'warning');
        hasError = true;
        return;
      }
      
      record.arrivalTime = arrivalTime;
      record.reason = reason.trim();
    }
    
    studentsStatus.push(record);
  });
  
  if (hasError) return;
  

  const attendance = getAllAttendance();
  const existingIndex = attendance.findIndex(a => a.date === date);
  
  const attendanceRecord = {
    date: date,
    students: studentsStatus
  };
  
  if (existingIndex !== -1) {
    attendance[existingIndex] = attendanceRecord;
  } else {
    attendance.push(attendanceRecord);
  }
  
  saveAttendance(attendance);
  showNotification('Présence enregistrée avec succès !', 'success');
}


function showNotification(message, type = 'success') {

  document.querySelectorAll('.custom-notification').forEach(el => el.remove());
  
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed custom-notification`;
  notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 150);
  }, 4000);
}


document.addEventListener('DOMContentLoaded', function() {

  setTodayDate();
  renderPresenceList();
  
 const dateInput = document.querySelector('.date-input');
  if (dateInput) {
    dateInput.addEventListener('change', renderPresenceList);
  }
  
  
  const saveButton = document.querySelector('.btn-save');
  if (saveButton) {
    saveButton.addEventListener('click', saveAttendanceRecord);
  }
  
 
 
});