// users array
const users = [
    {
        email: "admin@watchstore.com",
        password: "123",
        name: "Admin",
        image: "../images/admin.png" // Adjust path depending on structure, using ../ to simulate being in HOME page / User login-Register
    },
    {
        email: "user@watchstore.com",
        password: "123",
        name: "User",
        image: "../images/user.png"
    }
];

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        alert("Login Successful ✅");
        localStorage.setItem("user", JSON.stringify(user));
        // Redirect to homepage
        window.location.href = "../HOME page/index.html"; 
    } else {
        alert("Invalid Email or Password ❌");
    }
}

function logoutUser() {
    localStorage.removeItem("user");
    alert("Logged out successfully");
    window.location.reload();
}

// Update navbar image on page load
document.addEventListener("DOMContentLoaded", () => {
    const userIcon = document.getElementById("userIcon");
    const topLinks = document.getElementById("topLinksList"); // To toggle login/out links

    if (userIcon) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            userIcon.src = user.image; // Set the image from user data
            
            // Optionally, change Login/Register to Logout
            if (topLinks) {
                topLinks.innerHTML = `
                    <li><a href="#" onclick="logoutUser()">Logout (${user.name})</a></li>
                `;
            }
        } else {
            userIcon.src = "../images/default.png";
        }
    }
});
