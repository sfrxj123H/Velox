/**
 * Firebase Login Utility
 * Uses Namespace Import: FirebaseAuth
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import * as FirebaseAuth from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase for this module
const app = initializeApp(firebaseConfig);
const auth = FirebaseAuth.getAuth(app);

async function handleLogin() {
    const emailInput = document.getElementById('email');
    const pwInput = document.getElementById('pw');
    const submitBtn = document.getElementById('submit');

    const email = emailInput.value.trim();
    const password = pwInput.value;

    if (!email || !password) {
        showStatus("Please enter both email and password.", "error");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Logging in...";

    try {
        // Using the FirebaseAuth namespace
        const userCredential = await FirebaseAuth.signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("Login successful for:", user.email);
        showStatus("Success! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    } catch (error) {
        console.error("Login error:", error.code);
        let friendlyMessage = "Invalid email or password.";
        
        if (error.code === 'auth/invalid-email') friendlyMessage = "Invalid email format.";
        if (error.code === 'auth/user-disabled') friendlyMessage = "Account disabled.";
        
        showStatus(friendlyMessage, "error");
        submitBtn.disabled = false;
        submitBtn.innerText = "Log In";
    }
}

function showStatus(message, type) {
    let statusDiv = document.getElementById('status-message');
    if (statusDiv) {
        statusDiv.innerText = message;
        statusDiv.style.color = type === "error" ? "red" : "green";
    }
}

const submitBtn = document.getElementById('submit');
if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogin();
    });
    submitBtn.addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            e.preventDefault();
            handleLogin();
        }
    });
}