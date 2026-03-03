import { firebaseConfig } from "./firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import * as FirebaseAuth from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Initialize Firebase locally for this module
const app = initializeApp(firebaseConfig);
const auth = FirebaseAuth.getAuth(app);

/**
 * Executes the Firebase sign-out process
 */
async function performLogout() {
    try {
        // Use the namespace for the sign-out command
        await FirebaseAuth.signOut(auth);
        console.log("User successfully signed out.");
        
        // Redirect to login page
        window.location.href = "login.html";
    } catch (error) {
        console.error("Sign-out error:", error);
        alert("Error: Could not sign out. " + error.message);
    }
}

/**
 * Event Listener Setup
 * Targeting button with ID: logout
 */
const logoutBtn = document.getElementById('logout');

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performLogout();
    });
} else {
    // Helpful debug log if the button isn't found
    console.error("Logout error: Button with ID 'logout-btn' not found on this page.");
}