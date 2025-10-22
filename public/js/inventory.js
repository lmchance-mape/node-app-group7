document.addEventListener("DOMContentLoaded", () => {
  const inventoryTable = document.getElementById("inventoryTable");
  const addItemButton = document.getElementById("addItemButton");
  const addModal = document.getElementById("addModal");
  const addItemForm = document.getElementById("addItemForm");
  const cancelAdd = document.getElementById("cancelAdd");

  const editModal = document.getElementById("editModal");
  const editItemForm = document.getElementById("editItemForm");
  const cancelEdit = document.getElementById("cancelEdit");

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
        <td class="py-2 px-4 border border-gray-300">${item.servings}</td>
        <td class="py-2 px-4 border border-gray-300">${item.qty}</td>
        <td class="py-2 px-4 border border-gray-300">${item.expiration}</td>
        <td class="py-2 px-4 border border-gray-300 space-x-2">
          <button class="bg-blue-500 text-white px-2 py-1 rounded edit-btn" data-index="${index}">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      inventoryTable.appendChild(row);
    });

    // attach edit/delete buttons
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
  });

  // ----- Close Add Modal -----
  cancelAdd.addEventListener("click", () => {
    addModal.classList.add("hidden");
    addItemForm.reset();
  });

  // ----- Add Item (merge if exists) -----
  addItemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("itemName").value.trim();
    const servings = parseInt(document.getElementById("itemServings").value, 10);
    const qty = parseInt(document.getElementById("itemQty").value, 10);
    const expiration = document.getElementById("itemExpiration").value;

    const items = getInventory();
    const existingIndex = items.findIndex(item => item.name.toLowerCase() === name.toLowerCase());

    if (existingIndex !== -1) {
      // Update existing item
      items[existingIndex].qty = parseInt(items[existingIndex].qty) + qty;
      items[existingIndex].servings = parseInt(items[existingIndex].servings) + servings;
      // Update expiration to latest input
      items[existingIndex].expiration = expiration;
    } else {
      // Add new item
      items.push({ name, servings, qty, expiration });
    }

    saveInventory(items);
    renderInventory();

    addModal.classList.add("hidden");
    addItemForm.reset();
  });

  // ----- Open Edit Modal -----
  function openEditModal(index) {
    const items = getInventory();
    const item = items[index];
    editingIndex = index;

    document.getElementById("editName").value = item.name;
    document.getElementById("editServings").value = item.servings;
    document.getElementById("editQty").value = item.qty;
    document.getElementById("editExpiration").value = item.expiration;

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
  editItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = getInventory();
    if (editingIndex !== null) {
      items[editingIndex] = {
        name: document.getElementById("editName").value.trim(),
        servings: document.getElementById("editServings").value,
        qty: document.getElementById("editQty").value,
        expiration: document.getElementById("editExpiration").value
      };
      saveInventory(items);
      renderInventory();
      editModal.classList.add("hidden");
      editingIndex = null;
      editItemForm.reset();
    }
  });

  // ----- Delete Item -----
  function deleteItem(index) {
    const items = getInventory();
    items.splice(index, 1);
    saveInventory(items);
    renderInventory();
  }

  // Initial render
  renderInventory();
});
