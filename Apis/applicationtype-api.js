const APPLICATION_TYPE_API_URL = "/api/applicant_types";
let selectedApplicationTypeId = null;

// Fetch Application Types
async function fetchApplicationTypes() {
  try {
    const response = await fetch(APPLICATION_TYPE_API_URL);
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.warn("Unexpected API response structure:", result);
      return [];
    }
  } catch (error) {
    console.error("Error fetching application types:", error);
    // alert("Error fetching application types.");
    return [];
  }
}

// Load Application Types into Table
async function loadApplicationTypes() {
  const applicationTypes = await fetchApplicationTypes();
  const applicationTypeTable = document.getElementById("applicationTypeTable");
  applicationTypeTable.innerHTML = "";

  applicationTypes.forEach((applicationType, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${applicationType.name}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editApplicationType(${applicationType.id}, '${applicationType.name}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteApplicationType(${applicationType.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
    applicationTypeTable.insertAdjacentHTML("beforeend", row);
  });
}

// Add Application Type
document.getElementById("applicationTypeForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("applicationTypeInput").value;
  const result = await createApplicationType({ name });

  if (result?.success) {
    e.target.reset();
    await loadApplicationTypes();
    showSuccessModal(result.message || "Application Type added successfully!");
  } else {
    alert(result?.message || "Error adding application type.");
  }
});

// Create Application Type (POST with FormData)
async function createApplicationType(data) {
  try {
    const formData = new FormData();
    formData.append("name", data.name);

    const response = await fetch(APPLICATION_TYPE_API_URL, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating application type:", error);
    return null;
  }
}

// Edit Application Type - Show Modal
function editApplicationType(id, name) {
  selectedApplicationTypeId = id;
  document.getElementById("editApplicationTypeName").value = name;
  new bootstrap.Modal(document.getElementById("editApplicationTypeModal")).show();
}

// Update Application Type (PUT with x-www-form-urlencoded)
document.getElementById("editApplicationTypeForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("editApplicationTypeName").value;

  const result = await updateApplicationType({ id: selectedApplicationTypeId, name });

  if (result?.success) {
    bootstrap.Modal.getInstance(document.getElementById("editApplicationTypeModal")).hide();
    await loadApplicationTypes();
    showSuccessModal(result.message || "Application Type updated successfully!");
  } else {
    alert(result?.message || "Error updating application type.");
  }
});

async function updateApplicationType(data) {
  try {
    const params = new URLSearchParams();
    params.append("name", data.name);

    const urlWithId = `${APPLICATION_TYPE_API_URL}?id=${data.id}`;
    const response = await fetch(urlWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating application type:", error);
    return null;
  }
}

// Delete Application Type (DELETE with ID in query)
async function deleteApplicationType(id) {
  if (!confirm("Are you sure you want to delete this application type?")) return;

  try {
    const formData = new FormData();
    formData.append("action", "delete");

    const urlWithId = `${APPLICATION_TYPE_API_URL}?id=${id}`;
    const response = await fetch(urlWithId, {
      method: "DELETE",
      body: formData,
    });

    const result = await response.json();

    if (result?.success) {
      await loadApplicationTypes();
      showSuccessModal(result.message || "Application Type deleted successfully!");
    } else {
      alert(result?.message || "Error deleting application type.");
    }
  } catch (error) {
    console.error("Error deleting application type:", error);
  }
}

// Success Modal
function showSuccessModal(message) {
  const modal = document.createElement("div");
  modal.classList.add("modal", "fade");
  modal.setAttribute("tabindex", "-1");
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content text-center p-4">
        <div class="text-success fs-1 mb-2"><i class="bi bi-check-circle-fill"></i></div>
        <div class="fw-bold">${message}</div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  setTimeout(() => {
    bsModal.hide();
    modal.remove();
  }, 1500);
}

// Load application types on page load
document.addEventListener("DOMContentLoaded", loadApplicationTypes);
