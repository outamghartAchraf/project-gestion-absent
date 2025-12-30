
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


function getAttendanceByDate(date) {
  const attendance = getAllAttendance();
  return attendance.find(a => a.date === date);
}


function getInitials(prenom, nom) {
  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
}


function getRandomColor() {
  const colors = ['#ff9800', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}


function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00'); 
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


function renderHistoryList() {
  const attendance = getAllAttendance();
  const historyContainer = document.querySelector('.main-content > div:first-child');
  
  if (!historyContainer) return;
  

  const existingCards = historyContainer.querySelectorAll('.rounded-4.p-3.mb-3');
  existingCards.forEach(card => card.remove());
  
  
  const hr = historyContainer.querySelector('hr');
  
  if (attendance.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'text-center text-secondary mt-4';
    emptyMessage.textContent = 'Aucun historique disponible. Ajoutez des présences depuis la page Présence.';
    hr.after(emptyMessage);
    const detailsSections = document.querySelectorAll('.main-content > div:not(:first-child)');
    detailsSections.forEach(section => section.style.display = 'none');
    return;
  }
  
 
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
    
    hr.after(card);
  });
}



function showDayDetails(date) {
  const record = getAttendanceByDate(date);
  const students = getAllStudents();
  
  if (!record) return;
  
  const formattedDate = formatDate(date);
  
 
  const existingDetails = document.querySelectorAll('.main-content > div:not(:first-child)');
  existingDetails.forEach(section => section.remove());
  
 
  const mainContent = document.querySelector('.main-content');
  
  // Show Absents
  const absents = record.students.filter(s => s.status === 'absent');
  if (absents.length > 0) {
    const absentSection = createDetailSection(
      formattedDate, 
      'Absents', 
      absents, 
      students, 
      'danger',
      'Absent'
    );
    mainContent.appendChild(absentSection);
  }
  
  // Show Late students
  const lates = record.students.filter(s => s.status === 'late');
  if (lates.length > 0) {
    const lateSection = createDetailSection(
      formattedDate, 
      'Retards', 
      lates, 
      students, 
      'warning',
      null,
      true
    );
    mainContent.appendChild(lateSection);
  }
  

  const presents = record.students.filter(s => s.status === 'present');
  if (presents.length > 0) {
    const presentSection = createDetailSection(
      formattedDate, 
      'Présents', 
      presents, 
      students, 
      'success',
      'Présent'
    );
    mainContent.appendChild(presentSection);
  }
  
 
  const firstDetail = document.querySelector('.main-content > div:nth-child(2)');
  if (firstDetail) {
    setTimeout(() => {
      firstDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}



function createDetailSection(formattedDate, title, recordList, students, colorClass, statusText, isLate = false) {
  const section = document.createElement('div');
  section.className = 'p-4 mt-4 rounded-4';
  section.style.cssText = 'background:#163a63;color:white';
  
  let sectionHTML = `
    <h6 class="fw-semibold mb-3">Détails - ${formattedDate}</h6>
    <hr class="border-light opacity-25">
    <p class="text-${colorClass} fw-semibold">${title} (${recordList.length})</p>
  `;
  
  recordList.forEach(record => {
    const student = students.find(s => s.id === record.studentId);
    if (student) {
      const initials = getInitials(student.prenom, student.nom);
      const avatarColor = getRandomColor();
      
      let badgeContent = statusText;
      if (isLate) {
        badgeContent = `Retard - ${record.arrivalTime}<br><small class="text-light">Motif: ${record.reason}</small>`;
      }
      
      sectionHTML += `
        <div class="rounded-4 p-3 mb-3 d-flex justify-content-between align-items-center student-card"
             style="background:linear-gradient(135deg,#0b122f,#101a45)">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle d-flex justify-content-center align-items-center fw-bold"
                 style="width:42px;height:42px;background:${avatarColor};color:white;">
              ${initials}
            </div>
            <div>
              <div class="fw-semibold">${student.prenom} ${student.nom}</div>
              <small class="text-secondary">${student.group} · ID: #${String(student.id).padStart(3, '0')}</small>
            </div>
          </div>
          <span class="badge rounded-pill bg-${colorClass} px-3">${badgeContent}</span>
        </div>
      `;
    }
  });
  
  section.innerHTML = sectionHTML;
  return section;
}


function searchHistory(searchTerm) {
  const attendance = getAllAttendance();
  const students = getAllStudents();
  const historyContainer = document.querySelector('.main-content > div:first-child');
  const hr = historyContainer.querySelector('hr');
  
  if (!historyContainer) return;
  
  
  const existingCards = historyContainer.querySelectorAll('.rounded-4.p-3.mb-3');
  existingCards.forEach(card => card.remove());
  
  const term = searchTerm.toLowerCase().trim();
  
  
  if (!term) {
    renderHistoryList();
    return;
  }
  

  const filtered = attendance.filter(record => {
    const formattedDate = formatDate(record.date);
    

    if (formattedDate.toLowerCase().includes(term)) {
      return true;
    }
    
  
    return record.students.some(s => {
      const student = students.find(st => st.id === s.studentId);
      return student && 
             (student.prenom.toLowerCase().includes(term) ||
              student.nom.toLowerCase().includes(term) ||
              student.group.toLowerCase().includes(term));
    });
  });
  

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'text-center text-secondary mt-4';
    emptyMessage.textContent = 'Aucun résultat trouvé';
    hr.after(emptyMessage);
    return;
  }
  

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
    
    hr.after(card);
  });
}



document.addEventListener('DOMContentLoaded', function() {
  
  const staticDetails = document.querySelectorAll('.main-content > div:not(:first-child)');
  staticDetails.forEach(section => section.style.display = 'none');
  
  
  renderHistoryList();
  

  const searchInput = document.querySelector('input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchHistory(e.target.value);
    });
  }
  
  
 

 
}); 