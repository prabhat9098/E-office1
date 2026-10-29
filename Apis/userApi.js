const API_URL = "/api/users";
  let selectedAction = "";
  let selectedUser = null;

  // Load users from API
  async function fetchUsers() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
  
      // Check if result is valid and contains a 'data' array
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.warn("Unexpected API response structure:", result);
        return [];
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // alert("Error fetching users. Please try again later.");
      return [];
    }
  }
  

  async function loadUsers() {
    const users = await fetchUsers();
    const userTable = document.getElementById("userTable");
    userTable.innerHTML = "";

    users.forEach(user => {
      const row = `
        <tr>
          <td>${user.name}</td>
          <td>${user.role}</td>
          <td>${user.mobile_number}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="showPinModal('edit', ${user.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger" onclick="showPinModal('delete', ${user.id})"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
      userTable.insertAdjacentHTML("beforeend", row);
    });
  }

  // Add User
  document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("userName").value;
    const role = document.getElementById("userRole").value;
    const mobile = document.getElementById("userMobile").value;

    const result = await createUser({ name, role, mobile });
    if (result?.success) {
      e.target.reset();
      await loadUsers();
      showSuccessModal(result.message || "User added successfully!");
    } else {
      alert(result?.message || "Error adding user.");
    }

  });

  // Show PIN Modal
  function showPinModal(action, userId) {
    selectedAction = action;
    selectedUser = userId;
    document.getElementById("pinInput").value = "";
    new bootstrap.Modal(document.getElementById("pinModal")).show();
  }

  // PIN Form Submission
  document.getElementById("pinForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const pin = document.getElementById("pinInput").value;

    if (pin === "9098") {
      bootstrap.Modal.getInstance(document.getElementById("pinModal")).hide();

      const users = await fetchUsers();
      const user = users.find(u => u.id == selectedUser);

      if (selectedAction === "edit") {
        document.getElementById("editName").value = user.name;
        document.getElementById("editRole").value = user.role;
        document.getElementById("editMobile").value = user.mobile_number;
        new bootstrap.Modal(document.getElementById("editModal")).show();
      } else if (selectedAction === "delete") {
        const result = await deleteUser(user.id);
        if (result?.success) {
          await loadUsers();
          showSuccessModal(result.message || "User added successfully!");
        } else {
          alert(result?.message || "Error adding user.");
        }
      }
    } else {
      alert("Incorrect PIN!");
    }
  });

  // Edit Form Submission
  document.querySelector("#editModal form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("editName").value;
    const role = document.getElementById("editRole").value;
    const mobile = document.getElementById("editMobile").value;

    const result = await updateUser({ id: selectedUser, name, role, mobile });
    if (result?.success) {
      bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
      await loadUsers();
      showSuccessModal(result.message || "User Updates successfully!");
    } else {
      alert(result?.message || "Error adding user.");
    }
  });

  // Success Modal Display
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

  // API Functions with error handling
  async function createUser(user) {
    try {
      const formData = new FormData();
      
      formData.append("name", user.name);
      formData.append("role", user.role);
      formData.append("mobile_number", user.mobile);
      const res = await fetch(API_URL, { method: "POST", body: formData });
      return await res.json();
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Error creating user.");
      return null;
    }
  }

  async function updateUser(user) {
    try {
      const params = new URLSearchParams();
      params.append("name", user.name);
      params.append("role", user.role);
      params.append("mobile_number", user.mobile);
  
      const urlWithId = `${API_URL}?id=${user.id}`;
      const res = await fetch(urlWithId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
  
      return await res.json();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user.");
      return null;
    }
  }
  

  async function deleteUser(id) {
    try {
      const formData = new FormData();
      formData.append("action", "delete");
  
      const urlWithId = `${API_URL}?id=${id}`;
      const res = await fetch(urlWithId, { method: "DELETE", body: formData });
      return await res.json();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user.");
      return null;
    }
  }
  

  // Load data on page load
  document.addEventListener("DOMContentLoaded", function () {
    loadUsers();
  });