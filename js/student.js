
const STORAGE_KEY = 'enaa_students';

// Get all students from localStorage
function getAllStudents() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save students to localStorage
function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}



// ============================================
// CRUD OPERATIONS
// ============================================

// Add new student
function addStudent(studentData) {
  const students = getAllStudents();
  const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
  
  const newStudent = {
    id: newId,
    firstName: studentData.firstName.trim(),
    lastName: studentData.lastName.trim(),
    email: studentData.email.trim(),
    group: studentData.group,
    status: studentData.status
  };
  
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

// Update existing student
function updateStudent(id, studentData) {
  const students = getAllStudents();
  const index = students.findIndex(s => s.id === parseInt(id));
  
  if (index !== -1) {
    students[index] = {
      id: parseInt(id),
      firstName: studentData.firstName.trim(),
      lastName: studentData.lastName.trim(),
      email: studentData.email.trim(),
      group: studentData.group,
      status: studentData.status
    };
    saveStudents(students);
    return true;
  }
  return false;
}

// Delete student
function deleteStudent(id) {
  let students = getAllStudents();
  students = students.filter(s => s.id !== parseInt(id));
  saveStudents(students);
  updateStatistics();
  renderStudentTable();
}

// Get student by ID
function getStudentById(id) {
  const students = getAllStudents();
  return students.find(s => s.id === parseInt(id));
}

// ============================================
// UI RENDERING
// ============================================

// Get initials from name
function getInitials(firstName, lastName) {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

// Get random color for avatar
function getRandomColor() {
  const colors = ['#0d6efd', '#dc3545', '#ffc107', '#198754', '#0dcaf0', '#6f42c1', '#d63384'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Render student table
function renderStudentTable(studentsToRender = null) {
  const students = studentsToRender || getAllStudents();
  const tbody = document.querySelector('tbody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  students.forEach(student => {
    const tr = document.createElement('tr');
    const avatarColor = getRandomColor();
    const initials = getInitials(student.firstName, student.lastName);
    const statusBadge = student.status === 'Active' ? 'bg-success' : 'bg-danger';
    
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
               style="width:35px;height:35px; font-size: 0.875rem; background:${avatarColor}; color: white;">
            ${initials}
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.9rem;">${student.firstName} ${student.lastName}</div>
            <small class="d-md-none text-white-50">${student.email}</small>
          </div>
        </div>
      </td>
      <td class="align-middle hide-mobile">${student.email}</td>
      <td class="align-middle">${student.group}</td>
      <td class="align-middle">
        <span class="badge ${statusBadge}">${student.status}</span>
      </td>
      <td class="align-middle">
        <i class="fas fa-eye me-2" style="cursor: pointer;" onclick="viewStudent(${student.id})" title="Voir"></i>
        <i class="fas fa-edit me-2" style="cursor: pointer;" onclick="editStudent(${student.id})" title="Modifier"></i>
        <i class="fas fa-trash" style="cursor: pointer;" onclick="confirmDeleteStudent(${student.id})" title="Supprimer"></i>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

// Update statistics
function updateStatistics() {
  const students = getAllStudents();
  const total = students.length;
  const active = students.filter(s => s.status === 'Active').length;
  const inactive = students.filter(s => s.status === 'Inactive').length;
  
  // Update stats cards
  const totalEl = document.querySelector('.stats-card:nth-child(1) h2');
  const activeEl = document.querySelector('.stats-card:nth-child(2) h2');
  const inactiveEl = document.querySelector('.stats-card:nth-child(3) h2');
  
  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (inactiveEl) inactiveEl.textContent = inactive;
}

// ============================================
// MODAL OPERATIONS
// ============================================

let currentEditId = null;

// Show add student modal
function showAddModal() {
  currentEditId = null;
  document.querySelector('#addStudentModal .modal-title').innerHTML = 
    '<i class="fas fa-user-plus me-2"></i> Ajouter un étudiant';
  
  // Clear form
  document.querySelector('input[placeholder="Nom"]').value = '';
  document.querySelector('input[placeholder="Prénom"]').value = '';
  document.querySelector('input[type="email"]').value = '';
  document.querySelector('select').selectedIndex = 0;
  document.querySelectorAll('select')[1].selectedIndex = 0;
  
  const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
  modal.show();
}

// View student details
function viewStudent(id) {
  const student = getStudentById(id);
  if (!student) return;
  
  alert(`
Détails de l'étudiant:
━━━━━━━━━━━━━━━━━━━━
Nom: ${student.lastName}
Prénom: ${student.firstName}
Email: ${student.email}
Groupe: ${student.group}
Statut: ${student.status}
  `);
}

// Edit student
function editStudent(id) {
  const student = getStudentById(id);
  if (!student) return;
  
  currentEditId = id;
  
  // Update modal title
  document.querySelector('#addStudentModal .modal-title').innerHTML = 
    '<i class="fas fa-user-edit me-2"></i> Modifier un étudiant';
  
  // Fill form with student data
  const inputs = document.querySelectorAll('#addStudentModal input');
  inputs[0].value = student.lastName;
  inputs[1].value = student.firstName;
  inputs[2].value = student.email;
  
  const selects = document.querySelectorAll('#addStudentModal select');
  selects[0].value = student.group;
  selects[1].value = student.status;
  
  const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
  modal.show();
}

// Confirm delete
function confirmDeleteStudent(id) {
  const student = getStudentById(id);
  if (!student) return;
  
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${student.firstName} ${student.lastName} ?`)) {
    deleteStudent(id);
    showNotification('Étudiant supprimé avec succès', 'success');
  }
}

// Save student (add or update)
function saveStudentData() {
  const inputs = document.querySelectorAll('#addStudentModal input');
  const selects = document.querySelectorAll('#addStudentModal select');
  
  const lastName = inputs[0].value.trim();
  const firstName = inputs[1].value.trim();
  const email = inputs[2].value.trim();
  const group = selects[0].value;
  const status = selects[1].value;
  
  // Validation
  if (!lastName || !firstName || !email || !group || !status) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Veuillez entrer un email valide');
    return;
  }
  
  const studentData = {
    lastName,
    firstName,
    email,
    group,
    status
  };
  
  if (currentEditId) {
    // Update existing student
    updateStudent(currentEditId, studentData);
    showNotification('Étudiant modifié avec succès', 'success');
  } else {
    // Add new student
    addStudent(studentData);
    showNotification('Étudiant ajouté avec succès', 'success');
  }
  
  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
  modal.hide();
  
  // Refresh table and stats
  updateStatistics();
  renderStudentTable();
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function searchStudents(searchTerm) {
  const students = getAllStudents();
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    renderStudentTable();
    return;
  }
  
  const filtered = students.filter(student => {
    return (
      student.firstName.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.group.toLowerCase().includes(term) ||
      student.status.toLowerCase().includes(term)
    );
  });
  
  renderStudentTable(filtered);
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 150);
  }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize data
  //initializeData();
  
  // Render initial table and stats
  updateStatistics();
  renderStudentTable();
  
  // Search functionality
  const searchInput = document.querySelector('input[placeholder="Rechercher..."]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchStudents(e.target.value);
    });
  }
  
  // Add student button in modal
  const saveButton = document.querySelector('#addStudentModal .btn-success');
  if (saveButton) {
    saveButton.addEventListener('click', saveStudentData);
  }
  
  // Handle Enter key in form
  const modalInputs = document.querySelectorAll('#addStudentModal input, #addStudentModal select');
  modalInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveStudentData();
      }
    });
  });
  
  // Reset form when modal is closed
  const modal = document.getElementById('addStudentModal');
  if (modal) {
    modal.addEventListener('hidden.bs.modal', function() {
      currentEditId = null;
      document.querySelector('#addStudentModal .modal-title').innerHTML = 
        '<i class="fas fa-user-plus me-2"></i> Ajouter un étudiant';
    });
  }
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (menuToggle && sidebar && sidebarOverlay) {
  menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('show');
    sidebarOverlay.classList.toggle('show');
  });

  sidebarOverlay.addEventListener('click', function() {
    sidebar.classList.remove('show');
    sidebarOverlay.classList.remove('show');
  });

  // Close sidebar when clicking on a nav link (mobile)
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
      }
    });
  });
}