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

  function getInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }
  function saveInventory(items) {
    localStorage.setItem("inventory", JSON.stringify(items));
  }

  function renderInventory() {
    const items = getInventory();
    inventoryTable.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-100";

      row.innerHTML = `
        <td class="py-2 px-4 border border-gray-300">${item.item_id || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.user_email || ""}</td>
        <td class="py-2 px-4 border border-gray-300 font-semibold">${item.name}</td>
        <td class="py-2 px-4 border border-gray-300">${item.quantity}</td>
        <td class="py-2 px-4 border border-gray-300">${item.expiry_date}</td>
        <td class="py-2 px-4 border border-gray-300">${item.price || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.category || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.nutrition_info || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.added_at || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.date_acquired || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.serving_size || ""}</td>
        <td class="py-2 px-4 border border-gray-300">${item.servings_per || ""}</td>
        <td class="py-2 px-4 border border-gray-300 space-x-2">
          <button class="bg-blue-500 text-white px-2 py-1 rounded edit-btn" data-index="${index}">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      inventoryTable.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", e => openEditModal(e.target.dataset.index));
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", e => deleteItem(e.target.dataset.index));
    });
  }

  addItemButton.addEventListener("click", () => {
    addModal.classList.remove("hidden");
    addModal.classList.add("flex");
    document.getElementById("itemDateAcquired").value = new Date().toISOString().split("T")[0];
  });

  cancelAdd.addEventListener("click", () => {
    addModal.classList.add("hidden");
    addItemForm.reset();
  });

  addItemForm.addEventListener("submit", e => {
    e.preventDefault();

    const item = {
      item_id: Date.now(),
      user_email: document.getElementById("itemUserEmail").value.trim(),
      name: document.getElementById("itemName").value.trim(),
      quantity: parseInt(document.getElementById("itemQuantity").value, 10),
      expiry_date: document.getElementById("itemExpiryDate").value,
      price: document.getElementById("itemPrice").value,
      category: document.getElementById("itemCategory").value,
      nutrition_info: document.getElementById("itemNutrition").value,
      added_at: new Date().toISOString().split("T")[0],
      date_acquired: document.getElementById("itemDateAcquired").value,
      serving_size: document.getElementById("itemServingSize").value,
      servings_per: document.getElementById("itemServingsPer").value
    };

    const items = getInventory();
    items.push(item);
    saveInventory(items);

    renderInventory();
    addModal.classList.add("hidden");
    addItemForm.reset();
  });

  function openEditModal(index) {
    const items = getInventory();
    const item = items[index];
    editingIndex = index;

    document.getElementById("editUserEmail").value = item.user_email || "";
    document.getElementById("editName").value = item.name;
    document.getElementById("editQuantity").value = item.quantity;
    document.getElementById("editExpiryDate").value = item.expiry_date;
    document.getElementById("editPrice").value = item.price || "";
    document.getElementById("editCategory").value = item.category || "";
    document.getElementById("editNutrition").value = item.nutrition_info || "";
    document.getElementById("editDateAcquired").value = item.date_acquired || "";
    document.getElementById("editServingSize").value = item.serving_size || "";
    document.getElementById("editServingsPer").value = item.servings_per || "";

    editModal.classList.remove("hidden");
    editModal.classList.add("flex");
  }

  cancelEdit.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editingIndex = null;
    editItemForm.reset();
  });

  editItemForm.addEventListener("submit", e => {
    e.preventDefault();
    if (editingIndex === null) return;

    const items = getInventory();
    items[editingIndex] = {
      ...items[editingIndex],
      user_email: document.getElementById("editUserEmail").value.trim(),
      name: document.getElementById("editName").value.trim(),
      quantity: parseInt(document.getElementById("editQuantity").value, 10),
      expiry_date: document.getElementById("editExpiryDate").value,
      price: document.getElementById("editPrice").value,
      category: document.getElementById("editCategory").value,
      nutrition_info: document.getElementById("editNutrition").value,
      date_acquired: document.getElementById("editDateAcquired").value,
      serving_size: document.getElementById("editServingSize").value,
      servings_per: document.getElementById("editServingsPer").value
    };

    saveInventory(items);
    renderInventory();
    editModal.classList.add("hidden");
    editingIndex = null;
    editItemForm.reset();
  });

  function deleteItem(index) {
    const items = getInventory();
    items.splice(index, 1);
    saveInventory(items);
    renderInventory();
  }

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "/logon.html";
  });

  renderInventory();
});
