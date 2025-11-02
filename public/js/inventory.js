// inventory.js
document.addEventListener("DOMContentLoaded", () => {
  const addItemButton = document.getElementById("addItemButton");
  const addModal = document.getElementById("addModal");
  const cancelAdd = document.getElementById("cancelAdd");
  const addItemForm = document.getElementById("addItemForm");
  const inventoryGrid = document.getElementById("inventoryGrid");
  const searchInput = document.getElementById("searchInput");
  const toggleNutrition = document.getElementById("toggleNutrition");
  const nutritionSection = document.getElementById("nutritionSection");

  // Load saved items from localStorage
  let items = JSON.parse(localStorage.getItem("items")) || [];
  let editIndex = null; // Track which item is being edited

  // Toggle Nutrition Info visibility
  toggleNutrition.addEventListener("click", () => {
    const visible = !nutritionSection.classList.contains("hidden");
    if (visible) {
      nutritionSection.classList.add("hidden");
      toggleNutrition.textContent = "Show Nutritional Info";
    } else {
      nutritionSection.classList.remove("hidden");
      toggleNutrition.textContent = "Hide Nutritional Info";
    }
  });

  // Open/Close modal
  const openModal = () => addModal.classList.remove("hidden");
  const closeModal = () => {
    addModal.classList.add("hidden");
    addItemForm.reset();
    nutritionSection.classList.add("hidden");
    toggleNutrition.textContent = "Show Nutritional Info";
    editIndex = null; // Reset edit mode
  };

  addItemButton.addEventListener("click", openModal);
  cancelAdd.addEventListener("click", closeModal);

  // Add or Edit item
  addItemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const item = {
      name: document.getElementById("itemName").value.trim(),
      dateAcquired: document.getElementById("itemDateAcquired").value,
      expiration: document.getElementById("itemExpiration").value,
      quantity: document.getElementById("itemQuantity").value,
      servingSize: document.getElementById("itemServingSize").value,
      servingsPerContainer: document.getElementById("itemServingsPerContainer").value,
      nutrition: {
        calories: document.getElementById("itemCalories").value,
        protein: document.getElementById("itemProtein").value,
        carbs: document.getElementById("itemCarbs").value,
        fat: document.getElementById("itemFat").value,
      },
    };

    if (editIndex !== null) {
      // Update existing item
      items[editIndex] = item;
      editIndex = null;
    } else {
      // Add new item
      items.push(item);
    }

    localStorage.setItem("items", JSON.stringify(items));
    renderItems();
    closeModal();
  });

  // Render item cards
  const renderItems = (filter = "") => {
    inventoryGrid.innerHTML = "";

    const filtered = items.filter((i) =>
      i.name.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach((item, index) => {
      const today = new Date();
      const exp = new Date(item.expiration);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

      let status = "Fresh";
      let badgeColor = "bg-green-100 text-green-800";
      if (diffDays <= 0) {
        status = "Expired";
        badgeColor = "bg-red-100 text-red-800";
      } else if (diffDays <= 3) {
        status = "Soon";
        badgeColor = "bg-yellow-100 text-yellow-800";
      }

      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow p-4 flex flex-col justify-between border";

      card.innerHTML = `
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold">${item.name}</h3>
            <span class="text-sm px-2 py-1 rounded-full ${badgeColor}">${status}</span>
          </div>
          <p class="text-sm text-gray-500 mb-1">Expires: ${item.expiration}</p>
          <p class="text-sm text-gray-500 mb-1">Qty: ${item.quantity}</p>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button class="editBtn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" data-index="${index}">Edit</button>
          <button class="deleteBtn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-index="${index}">Delete</button>
        </div>
      `;

      inventoryGrid.appendChild(card);
    });

    // Delete
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        items.splice(index, 1);
        localStorage.setItem("items", JSON.stringify(items));
        renderItems(searchInput.value);
      });
    });

    // Edit
    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        const item = items[index];

        // Fill form with current values
        document.getElementById("itemName").value = item.name;
        document.getElementById("itemDateAcquired").value = item.dateAcquired;
        document.getElementById("itemExpiration").value = item.expiration;
        document.getElementById("itemQuantity").value = item.quantity;
        document.getElementById("itemServingSize").value = item.servingSize;
        document.getElementById("itemServingsPerContainer").value = item.servingsPerContainer;
        document.getElementById("itemCalories").value = item.nutrition.calories;
        document.getElementById("itemProtein").value = item.nutrition.protein;
        document.getElementById("itemCarbs").value = item.nutrition.carbs;
        document.getElementById("itemFat").value = item.nutrition.fat;

        // Show nutrition section if it has data
        if (
          item.nutrition.calories ||
          item.nutrition.protein ||
          item.nutrition.carbs ||
          item.nutrition.fat
        ) {
          nutritionSection.classList.remove("hidden");
          toggleNutrition.textContent = "Hide Nutritional Info";
        }

        editIndex = index;
        openModal();
      });
    });
  };

  // Search filter
  searchInput.addEventListener("input", (e) => renderItems(e.target.value));

  // Initial render
  renderItems();
});
