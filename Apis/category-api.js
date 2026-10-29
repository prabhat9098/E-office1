const CATEGORY_API_URL = "/api/categories";
let selectedCategoryId = null;

// Fetch Categories
async function fetchCategories() {
  try {
    const response = await fetch(CATEGORY_API_URL);
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.warn("Unexpected API response structure:", result);
      return [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    // alert("Error fetching categories.");
    return [];
  }
}

// Load Categories into Table
async function loadCategories() {
  const categories = await fetchCategories();
  const categoryTable = document.getElementById("categoryTable");
  categoryTable.innerHTML = "";

  categories.forEach((category, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${category.name}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editCategory(${category.id}, '${category.name}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
    categoryTable.insertAdjacentHTML("beforeend", row);
  });
}

// Add Category
document.getElementById("categoryForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("categoryName").value;
  const result = await createCategory({ name });

  if (result?.success) {
    e.target.reset();
    await loadCategories();
    showSuccessModal(result.message || "Category added successfully!");
  } else {
    alert(result?.message || "Error adding category.");
  }
});

// Create Category (POST with FormData)
async function createCategory(data) {
  try {
    const formData = new FormData();
    formData.append("name", data.name);

    const response = await fetch(CATEGORY_API_URL, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
}

// Edit Category - Show Modal
function editCategory(id, name) {
  selectedCategoryId = id;
  document.getElementById("editCategoryName").value = name;
  new bootstrap.Modal(document.getElementById("editCategoryModal")).show();
}

// Update Category (PUT with x-www-form-urlencoded)
document.getElementById("editCategoryForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("editCategoryName").value;

  const result = await updateCategory({ id: selectedCategoryId, name });

  if (result?.success) {
    bootstrap.Modal.getInstance(document.getElementById("editCategoryModal")).hide();
    await loadCategories();
    showSuccessModal(result.message || "Category updated successfully!");
  } else {
    alert(result?.message || "Error updating category.");
  }
});

async function updateCategory(data) {
  try {
    const params = new URLSearchParams();
    params.append("name", data.name);

    const urlWithId = `${CATEGORY_API_URL}?id=${data.id}`;
    const response = await fetch(urlWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
}

// Delete Category (DELETE with ID in query)
async function deleteCategory(id) {
  if (!confirm("Are you sure you want to delete this category?")) return;

  try {
    const formData = new FormData();
    formData.append("action", "delete");

    const urlWithId = `${CATEGORY_API_URL}?id=${id}`;
    const response = await fetch(urlWithId, {
      method: "DELETE",
      body: formData,
    });

    const result = await response.json();

    if (result?.success) {
      await loadCategories();
      showSuccessModal(result.message || "Category deleted successfully!");
    } else {
      alert(result?.message || "Error deleting category.");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
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

// Load categories on page load
document.addEventListener("DOMContentLoaded", loadCategories);
