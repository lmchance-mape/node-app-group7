document.addEventListener("DOMContentLoaded", () => {
  const inventoryTable = document.getElementById("inventoryTable");
  const addItemButton = document.getElementById("addItemButton");
  const addModal = document.getElementById("addModal");
  const addItemForm = document.getElementById("addItemForm");
  const cancelAdd = document.getElementById("cancelAdd");
  const editModal = document.getElementById("editModal");
  const editItemForm = document.getElementById("editItemForm");
  const cancelEdit = document.getElementById("cancelEdit");
  const logoutButton = document.getElementById("logoutButton");

  let editingIndex = null;

  // ----- LocalStorage helpers -----
  function getInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }
  function saveInventory(items) {
    localStorage.setItem("inventory", JSON.stringify(items));
  }

  // ----- Render table -----
  function renderInventory() {
    const items = getInventory();
    inventoryTable.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-100";

      row.innerHTML = `
        <td class="py-2 px-4 border border-gray-300 font-semibold">${item.name}</td>
        <td class="py-2 px-4 border border-gray-300">${item.servingsPerContainer || item.servings || '-'}</td>
        <td class="py-2 px-4 border border-gray-300">${item.quantity || item.qty}</td>
        <td class="py-2 px-4 border border-gray-300">${item.expiration || item.expiry_date || '-'}</td>
        <td class="py-2 px-4 border border-gray-300 space-x-2">
          <button class="bg-blue-500 text-white px-2 py-1 rounded edit-btn" data-index="${index}">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      inventoryTable.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        openEditModal(index);
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        deleteItem(index);
      });
    });
  }

  // ----- Open Add Modal -----
  addItemButton.addEventListener("click", () => {
    addModal.classList.remove("hidden");
    addModal.classList.add("flex");
    document.getElementById("itemDateAcquired").value = new Date().toISOString().split("T")[0];
  });

  // ----- Close Add Modal -----
  cancelAdd.addEventListener("click", () => {
    addModal.classList.add("hidden");
    addItemForm.reset();
    document.getElementById("itemDateAcquired").value = new Date().toISOString().split("T")[0];
  });

  // ----- Add Item (merge if exists) -----
  addItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    console.log("Add token:", token); // Debug

    const name = document.getElementById("itemName").value.trim();
    const dateAcquired = document.getElementById("itemDateAcquired").value;
    const expiration = document.getElementById("itemExpiration").value;
    const quantity = parseInt(document.getElementById("itemQuantity").value, 10);
    const servingSize = document.getElementById("itemServingSize").value.trim();
    const servingsPerContainer = parseInt(document.getElementById("itemServingsPerContainer").value, 10);
    const calories = document.getElementById("itemCalories").value || null;
    const protein = document.getElementById("itemProtein").value || null;
    const carbs = document.getElementById("itemCarbs").value || null;
    const fat = document.getElementById("itemFat").value || null;

    const items = getInventory();
    const existingIndex = items.findIndex(item => item.name.toLowerCase() === name.toLowerCase());

    if (existingIndex !== -1) {
      items[existingIndex].quantity += quantity;
      items[existingIndex].servingsPerContainer += servingsPerContainer;
      items[existingIndex].expiration = expiration;
      if (dateAcquired) items[existingIndex].dateAcquired = dateAcquired;
      if (servingSize) items[existingIndex].servingSize = servingSize;
      if (calories) items[existingIndex].calories = calories;
      if (protein) items[existingIndex].protein = protein;
      if (carbs) items[existingIndex].carbs = carbs;
      if (fat) items[existingIndex].fat = fat;
    } else {
      items.push({ name, dateAcquired, expiration, quantity, servingSize, servingsPerContainer, calories, protein, carbs, fat });
    }

    saveInventory(items);

    // Try to sync with MySQL
    if (token) {
      try {
        const response = await fetch("/api/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name, quantity, expiry_date: expiration, date_acquired: dateAcquired,
            serving_size: servingSize, servings_per_container: servingsPerContainer,
            calories: calories ? parseInt(calories) : null,
            protein: protein ? parseFloat(protein) : null,
            carbs: carbs ? parseFloat(carbs) : null,
            fat: fat ? parseFloat(fat) : null
          })
        });
        if (response.ok) {
          const data = await response.json();
          items[existingIndex !== -1 ? existingIndex : items.length - 1].item_id = data.item_id; // Assign ID if new
          saveInventory(items); // Update with ID
          console.log("MySQL sync successful:", data.message);
        } else {
          console.log("MySQL sync failed, using localStorage:", await response.text());
        }
      } catch (error) {
        console.log("MySQL sync error, using localStorage:", error.message);
      }
    }

    renderInventory();
    addModal.classList.add("hidden");
    addItemForm.reset();
    document.getElementById("itemDateAcquired").value = new Date().toISOString().split("T")[0];
  });

  // ----- Open Edit Modal -----
  function openEditModal(index) {
    const items = getInventory();
    const item = items[index];
    editingIndex = index;

    document.getElementById("editName").value = item.name;
    document.getElementById("editDateAcquired").value = item.dateAcquired || new Date().toISOString().split("T")[0];
    document.getElementById("editExpiration").value = item.expiration;
    document.getElementById("editQuantity").value = item.quantity;
    document.getElementById("editServingSize").value = item.servingSize || "";
    document.getElementById("editServingsPerContainer").value = item.servingsPerContainer || "";
    document.getElementById("editCalories").value = item.calories || "";
    document.getElementById("editProtein").value = item.protein || "";
    document.getElementById("editCarbs").value = item.carbs || "";
    document.getElementById("editFat").value = item.fat || "";

    editModal.classList.remove("hidden");
    editModal.classList.add("flex");
  }

  // ----- Close Edit Modal -----
  cancelEdit.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editingIndex = null;
    editItemForm.reset();
  });

  // ----- Save edits -----
  editItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    console.log("Edit token:", token); // Debug

    if (editingIndex !== null) {
      const items = getInventory();
      const item = items[editingIndex];
      item.name = document.getElementById("editName").value.trim();
      item.dateAcquired = document.getElementById("editDateAcquired").value;
      item.expiration = document.getElementById("editExpiration").value;
      item.quantity = document.getElementById("editQuantity").value;
      item.servingSize = document.getElementById("editServingSize").value.trim();
      item.servingsPerContainer = document.getElementById("editServingsPerContainer").value;
      item.calories = document.getElementById("editCalories").value || null;
      item.protein = document.getElementById("editProtein").value || null;
      item.carbs = document.getElementById("editCarbs").value || null;
      item.fat = document.getElementById("editFat").value || null;

      saveInventory(items);

      // Try to sync edit with MySQL
      if (token && item.item_id) {
        try {
          const response = await fetch(`/api/inventory/${item.item_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              name: item.name, quantity: item.quantity, expiry_date: item.expiration,
              date_acquired: item.dateAcquired, serving_size: item.servingSize,
              servings_per_container: item.servingsPerContainer, calories: item.calories,
              protein: item.protein, carbs: item.carbs, fat: item.fat
            })
          });
          if (response.ok) {
            console.log("MySQL edit sync successful");
          } else {
            console.log("MySQL edit sync failed:", await response.text());
          }
        } catch (error) {
          console.log("MySQL edit sync error:", error.message);
        }
      }

      renderInventory();
      editModal.classList.add("hidden");
      editingIndex = null;
      editItemForm.reset();
    }
  });

  // ----- Delete Item -----
  function deleteItem(index) {
    const items = getInventory();
    const item = items[index];
    items.splice(index, 1);
    saveInventory(items);

    // Try to sync delete with MySQL
    const token = localStorage.getItem("jwtToken");
    if (token && item.item_id) {
      fetch(`/api/inventory/${item.item_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(error => console.log("MySQL delete sync error:", error.message));
    }

    renderInventory();
  }

  // ----- Toggle Nutritional Info -----
  document.getElementById("toggleNutrition").addEventListener("click", () => {
    const nutritionFields = document.getElementById("nutritionFields");
    nutritionFields.classList.toggle("hidden");
    document.getElementById("toggleNutrition").textContent = nutritionFields.classList.contains("hidden")
      ? "Show Nutritional Info"
      : "Hide Nutritional Info";
  });

  document.getElementById("editToggleNutrition").addEventListener("click", () => {
    const editNutritionFields = document.getElementById("editNutritionFields");
    editNutritionFields.classList.toggle("hidden");
    document.getElementById("editToggleNutrition").textContent = editNutritionFields.classList.contains("hidden")
      ? "Show Nutritional Info"
      : "Hide Nutritional Info";
  });

  // ----- Logout -----
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/logon.html";
  });

// ====== Initial render (Load from backend) ======
async function loadInventoryFromServer() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    console.warn("No token found — falling back to localStorage");
    renderInventory();
    return;
  }

  try {
    const response = await fetch("/api/inventory", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error("Failed to fetch inventory:", await response.text());
      renderInventory();
      return;
    }

    const data = await response.json();
    console.log("Loaded items from MySQL:", data.items);

    // Save to localStorage so edit/delete still work offline
    localStorage.setItem("inventory", JSON.stringify(data.items));
    renderInventory();
  } catch (err) {
    console.error("Error loading inventory:", err);
    renderInventory();
  }
}

// Load from server first
loadInventoryFromServer();

});