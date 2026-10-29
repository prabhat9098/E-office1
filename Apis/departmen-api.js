// Department Management Script
const DEPARTMENT_API_URL = "/api/departments";
let selectedDepartmentId = null;

// Fetch Departments
async function fetchDepartments() {
  try {
    const response = await fetch(DEPARTMENT_API_URL);
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.warn("Unexpected API response structure:", result);
      return [];
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    // alert("Error fetching departments.");
    return [];
  }
}

// Load Departments into Table
async function loadDepartments() {
  const departments = await fetchDepartments();
  const departmentTable = document.getElementById("departmentTable");
  departmentTable.innerHTML = "";

  departments.forEach((department, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${department.name}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editDepartment(${department.id}, '${department.name}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${department.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
    departmentTable.insertAdjacentHTML("beforeend", row);
  });
}

// Add Department
document.getElementById("departmentForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("departmentInput").value;
  const result = await createDepartment({ name });

  if (result?.success) {
    e.target.reset();
    await loadDepartments();
    showSuccessModal(result.message || "Department added successfully!");
  } else {
    alert(result?.message || "Error adding department.");
  }
});

// Create Department (POST with FormData)
async function createDepartment(data) {
  try {
    const formData = new FormData();
    formData.append("name", data.name);

    const response = await fetch(DEPARTMENT_API_URL, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating department:", error);
    return null;
  }
}

// Edit Department - Show Modal
function editDepartment(id, name) {
  selectedDepartmentId = id;
  document.getElementById("editDepartmentName").value = name;
  new bootstrap.Modal(document.getElementById("editDepartmentModal")).show();
}

// Update Department (PUT with x-www-form-urlencoded)
document.getElementById("editDepartmentForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("editDepartmentName").value;

  const result = await updateDepartment({ id: selectedDepartmentId, name });

  if (result?.success) {
    bootstrap.Modal.getInstance(document.getElementById("editDepartmentModal")).hide();
    await loadDepartments();
    showSuccessModal(result.message || "Department updated successfully!");
  } else {
    alert(result?.message || "Error updating department.");
  }
});

async function updateDepartment(data) {
  try {
    const params = new URLSearchParams();
    params.append("name", data.name);

    const urlWithId = `${DEPARTMENT_API_URL}?id=${data.id}`;
    const response = await fetch(urlWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating department:", error);
    return null;
  }
}

// Delete Department (DELETE with ID in query)
async function deleteDepartment(id) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  try {
    const formData = new FormData();
    formData.append("action", "delete");

    const urlWithId = `${DEPARTMENT_API_URL}?id=${id}`;
    const response = await fetch(urlWithId, {
      method: "DELETE",
      body: formData,
    });

    const result = await response.json();

    if (result?.success) {
      await loadDepartments();
      showSuccessModal(result.message || "Department deleted successfully!");
    } else {
      alert(result?.message || "Error deleting department.");
    }
  } catch (error) {
    console.error("Error deleting department:", error);
  }
}

// Load departments on page load
document.addEventListener("DOMContentLoaded", loadDepartments);
