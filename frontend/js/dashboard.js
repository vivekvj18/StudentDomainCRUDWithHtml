const API_URL = "http://localhost:8080/api/domains";
let authToken = sessionStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", () => {
    if (!authToken) {
        window.location.href = "index.html";
        return;
    }
    document.getElementById("userEmail").innerText = sessionStorage.getItem("authEmail") || "Admin";
    fetchDomains();
});

// --- 1. FETCH & RENDER DOMAINS ---
async function fetchDomains() {
    try {
        const response = await fetch(API_URL, {
            headers: { "Authorization": "Basic " + authToken }
        });
        if (!response.ok) throw new Error("Failed");
        const domains = await response.json();
        renderTable(domains);
    } catch (error) {
        console.error(error);
        alert("Error loading data.");
    }
}

function renderTable(domains) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    domains.forEach(d => {
        const row = `
            <tr>
                <td><strong>${d.program}</strong></td>
                <td>${d.batch}</td>
                <td><span style="background:#e0f2f1; color:#00695c; padding:4px 8px; borderRadius:4px; font-size:0.85rem;">${d.capacity} Seats</span></td>
                <td>${d.qualification}</td>
                <td>
                    <button class="action-btn view-btn" onclick="viewStudents(${d.domainId}, '${d.program}')" title="View Students"><i class="fas fa-users"></i></button>
                    <button class="action-btn edit-btn" onclick="editDomain(${d.domainId}, '${d.program}', '${d.batch}', ${d.capacity}, '${d.qualification}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDomain(${d.domainId})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- 2. ADD / EDIT DOMAIN HANDLER ---
const domainForm = document.getElementById("domainForm");
domainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("domainId").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

    const data = {
        program: document.getElementById("program").value,
        batch: document.getElementById("batch").value,
        capacity: document.getElementById("capacity").value,
        qualification: document.getElementById("qualification").value
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Basic " + authToken 
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            fetchDomains(); // Refresh table
            alert(id ? "Domain Updated!" : "Domain Added!");
        } else {
            alert("Error saving domain.");
        }
    } catch (err) { console.error(err); }
});

// --- 3. DELETE DOMAIN ---
async function deleteDomain(id) {
    if(!confirm("Are you sure you want to delete this domain?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Basic " + authToken }
        });
        if (response.ok) fetchDomains();
        else alert("Could not delete. Check if students exist.");
    } catch (err) { console.error(err); }
}

// --- 4. VIEW STUDENTS ---
async function viewStudents(id, programName) {
    const list = document.getElementById("studentList");
    const modal = document.getElementById("studentModal");
    document.getElementById("studentDomainName").innerText = "Program: " + programName;
    list.innerHTML = "<li>Loading...</li>";
    modal.style.display = "flex";

    try {
        const response = await fetch(`${API_URL}/${id}/students`, {
            headers: { "Authorization": "Basic " + authToken }
        });
        const students = await response.json();
        
        list.innerHTML = "";
        if(students.length === 0) {
            list.innerHTML = "<li style='color:#888;'>No students enrolled yet.</li>";
            return;
        }

        students.forEach(s => {
            list.innerHTML += `
                <li>
                    <div class="student-avatar">${s.firstName.charAt(0)}</div>
                    <div>
                        <strong>${s.firstName} ${s.lastName || ""}</strong><br>
                        <span style="font-size:0.85rem; color:#666;">${s.email}</span>
                    </div>
                </li>
            `;
        });
    } catch (err) { 
        list.innerHTML = "<li style='color:red;'>Error fetching students.</li>";
    }
}

// --- HELPER FUNCTIONS (MODAL) ---
function openModal() {
    document.getElementById("modalTitle").innerText = "Add New Domain";
    document.getElementById("domainForm").reset();
    document.getElementById("domainId").value = "";
    document.getElementById("domainModal").style.display = "flex";
}

function editDomain(id, prog, batch, cap, qual) {
    document.getElementById("modalTitle").innerText = "Edit Domain";
    document.getElementById("domainId").value = id;
    document.getElementById("program").value = prog;
    document.getElementById("batch").value = batch;
    document.getElementById("capacity").value = cap;
    document.getElementById("qualification").value = qual;
    document.getElementById("domainModal").style.display = "flex";
}

function closeModal() { document.getElementById("domainModal").style.display = "none"; }
function closeStudentModal() { document.getElementById("studentModal").style.display = "none"; }
function handleLogout() { sessionStorage.clear(); window.location.href = "index.html"; }

// Close modal if clicked outside
window.onclick = function(event) {
    if (event.target == document.getElementById("domainModal")) closeModal();
    if (event.target == document.getElementById("studentModal")) closeStudentModal();
}