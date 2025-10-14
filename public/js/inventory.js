document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const logoutButton = document.getElementById('logoutButton');
    const addItemButton = document.getElementById('addItemButton');
    const inventoryList = document.getElementById('inventoryList');

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        window.location.href = '/';
    });

    addItemButton.addEventListener('click', () => {
        // Placeholder for form/modal to add item
        alert('Add item form coming soon!');
    });

    // Invoke protected /api/inventory route
    async function fetchInventory() {
        try {
            const response = await fetch('/api/inventory', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                inventoryList.innerHTML = '';
                data.items.forEach(item => {
                    const li = document.createElement('li');
                    li.classList.add('bg-white', 'p-2', 'rounded', 'shadow');
                    li.textContent = `${item.name} - ${item.quantity} units, Expires: ${item.expiry_date}`;
                    inventoryList.appendChild(li);
                });
            } else {
                inventoryList.innerHTML = '<li class="text-red-500">Error loading inventory.</li>';
            }
        } catch (error) {
            inventoryList.innerHTML = '<li class="text-red-500">Error connecting to server.</li>';
        }
    }

    fetchInventory();
});