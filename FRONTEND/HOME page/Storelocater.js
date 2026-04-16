const stores = [
    {
        city: "Mumbai",
        name: "Velmora Luxury",
        address: "Bandra, Mumbai",
        phone: "9876543210"
    },
    {
        city: "Pune",
        name: "Velmora Premium",
        address: "FC Road, Pune",
        phone: "9876543211"
    },
    {
        city: "Delhi",
        name: "Velmora Elite",
        address: "Connaught Place, Delhi",
        phone: "9876543212"
    }
];

// Show store info when clicking marker
function showStore(city) {
    const store = stores.find(s => s.city === city);

    document.getElementById("storeInfo").innerHTML = `
        <h3>${store.name}</h3>
        <p>${store.city}</p>
        <p>${store.address}</p>
        <p>${store.phone}</p>
    `;
}

// Search function
function searchStore() {
    const input = document.getElementById("searchBox").value.toLowerCase();

    const store = stores.find(s => s.city.toLowerCase().includes(input));

    if (store) {
        showStore(store.city);
    } else {
        document.getElementById("storeInfo").innerHTML = "No store found ❌";
    }
}