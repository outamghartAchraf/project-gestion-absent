function getStudents(){
    return JSON.parse(localStorage.getItem("enaa_students")) || []
}
function setStudents(students){
    localStorage.setItem("enaa_students",JSON.stringify(students))
}


function saveStudent(){
    const students = getStudents()
    const date = new Date()
    const creationDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}-${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
  
    const nomInput = document.getElementById("nomInput")
    const prenomInput = document.getElementById("prenomInput")
    const emailInput = document.getElementById("emailInput")
    const groupInput = document.getElementById("groupSelect")
    const statutInput = document.getElementById("statutSelect")

    let newId = students.length > 0 ? students[students.length - 1].id + 1 : 1;
    let studentObj = {id:newId,nom: nomInput.value,prenom:prenomInput.value,email:emailInput.value,group: groupInput.value,status:statutInput.value,dateInscription:creationDate}
    students.push(studentObj)

    setStudents(students)
    showMessage(`Etudiant "${nomInput.value} ${prenomInput.value}" ajouter avec succes!`, 5000);
    fillList()
}

function fillList(){
    const list = document.querySelector("#studentsTable tbody")
    list.innerHTML = ""
    const students = getStudents()
    for(student of students){
        const tr = document.createElement("tr")

        const badge = student.status === "Active" ? "bg-success" : "bg-danger";
        const studentid = student.id;
        tr.innerHTML = `<td>${student.nom}</td>
                        <td>${student.prenom}</td>
                        <td>${student.email}</td>
                        <td>${student.group}</td>
                        <td><span class="badge ${badge}">${student.status}</span></td>
                        <td><button onClick="showStudentInfos(${studentid})" class="btn btn-link p-0 text-white" data-bs-toggle="modal" data-bs-target="#showStudentInfos"><i class="bi bi-eye"></i></button> 
                        <button onClick= "editStudent(${studentid})" class="btn btn-link p-0 text-white" data-bs-toggle="modal" data-bs-target="#editStudentModal"><i class="bi bi-pencil-square"></i></button> 
                        <button onClick= "deleteStudent(${studentid})" class="btn btn-link p-0 text-white"><i class="bi bi-trash"></i></button> 
                        </td>`
        list.appendChild(tr)
    }
}


function statistics(){
const students = getStudents()
const totalStudents = document.querySelector("#totalEtudiants h3")
totalStudents.innerHTML = `${students.length} <i class="bi bi-people-fill"></i>`

const etudiantsActif = document.querySelector("#etudiantsActif h3")
const etudiantsInactif = document.querySelector("#etudiantsInactif h3")
let activesum = 0
let inactivesum = 0
for(student of students){
    if(student.status === "Active"){
        activesum++;
    }else if(student.status === "Inactive"){
        inactivesum++;
    }
}
etudiantsActif.innerHTML = `${activesum} <i class="bi bi-person-check">`
etudiantsInactif.innerHTML = `${inactivesum} <i class="bi bi-person-exclamation"></i>`
}


function deleteStudent(studentId){
    const confirmed = confirm(`are you sure you want to delete this student ?`)
    if(!confirmed) return;

    const students = getStudents()
    const index = students.findIndex(item => item.id === studentId);
    
    students.splice(index,1);
    setStudents(students)
    fillList()
}

function editStudent(studentId) {
 
const students = getStudents()
let student = students.find(item => item.id === studentId)
    document.getElementById("editNom").value = student.nom
    document.getElementById("editPrenom").value = student.prenom
    document.getElementById("editEmail").value = student.email
    document.getElementById("editGroup").value = student.group
    document.getElementById("editStatut").value = student.status

    const savebtn = document.getElementById("saveUpdatedStudent")
    savebtn.dataset.studentId = student.id
    
}

function saveEditedStudent(){
    const savebtn = document.getElementById("saveUpdatedStudent")
    const studentId = parseInt(savebtn.dataset.studentId)

    const students = getStudents()
    const index = students.findIndex(item => item.id === studentId);

        students[index].nom = document.getElementById("editNom").value;
        students[index].prenom = document.getElementById("editPrenom").value;
        students[index].email = document.getElementById("editEmail").value;
        students[index].group = document.getElementById("editGroup").value;
        students[index].status = document.getElementById("editStatut").value;

    setStudents(students)   
    showMessage(`Etudiant "${students[index].nom} ${students[index].prenom}" modifier avec succes!`, 5000);
    fillList()
}



    
    addEventListener("keydown", function(event){
        const search = document.getElementById("recherche")
        const students = getStudents()
        if(event.key === "Enter"){
            let word = search.value;    
            const student = students.filter(item => item.nom.toLowerCase().includes(word.toLowerCase()) || 
                                        item.prenom.toLowerCase().includes(word.toLowerCase()))
            console.log(student)
        if(student.length > 0){
            const list = document.querySelector("#studentsTable tbody")
        list.innerHTML = ""
            for(st of student){
        const tr = document.createElement("tr")

        const badge = st.status === "Active" ? "bg-success" : "bg-danger";
        const studentid = st.id;
        tr.innerHTML = `<td>${st.nom}</td>
                        <td>${st.prenom}</td>
                        <td>${st.email}</td>
                        <td>${st.group}</td>
                        <td><span class="badge ${badge}">${st.status}</span></td>
                        <td><button onClick="showStudentInfos(${studentid})" class="btn btn-link p-0" data-bs-toggle="modal" data-bs-target="#showStudentInfos"><i class="bi bi-eye"></i></button> 
                        <button onClick= "editStudent(${studentid})" class="btn btn-link p-0" data-bs-toggle="modal" data-bs-target="#editStudentModal"><i class="bi bi-pencil-square"></i></button> 
                        <button onClick= "deleteStudent(${studentid})" class="btn btn-link p-0"><i class="bi bi-trash"></i></button> 
                        </td>`
        list.appendChild(tr)
            }

    } else if(student.length == 0){showMessage("Pas d'etudiant trouvé", 5000)}
        }
    })



function showStudentInfos(studentid){
    const students = getStudents()
    let student = students.find(item => item.id === studentid)
    document.getElementById("showNom").textContent = `Nom: ${student.nom}`
    document.getElementById("showPrenom").textContent = `Prénom: ${student.prenom}`
    document.getElementById("showEmail").textContent = `Email: ${student.email}`
    document.getElementById("showGroup").textContent = `Group: ${student.group}`
    document.getElementById("showStatus").textContent = `Statut: ${student.status}`
    document.getElementById("showDate").textContent = `Date d'inscription: ${student.dateInscription}`
}

function showMessage(text, duration = 5000) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.style.display = "block";
    msg.style.opacity = 1;

    setTimeout(() => {
        msg.style.opacity = 0;
        setTimeout(() => { msg.style.display = "none"; }, 300); // wait for fade-out
    }, duration);
}

//  7. SIDEBAR TOGGLE (BEGINNER FRIENDLY)
//  *************************************************

document.addEventListener("DOMContentLoaded", function () {

  let toggleBtn = document.getElementById("sidebarToggle");
  let sidebar = document.querySelector(".sidebar");

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    sidebar.classList.toggle("show");
  });

  document.addEventListener("click", function (event) {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(event.target) &&
      !toggleBtn.contains(event.target)
    ) {
      sidebar.classList.remove("show");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
    statistics()
    fillList()
})