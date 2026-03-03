
import { firebaseConfig } from "./firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import * as FirebaseAuth from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
            window.location.href = "../dashboard/index.html";
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
const resetpwBtn = document.getElementById('resetpw-btn');
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogin();
});
resetpwBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handlePasswordReset();
});
resetpwBtn.addEventListener('keypress', (e) => {
    e.preventDefault();
    handlePasswordReset();
});

async function handlePasswordReset() {
    const emailInput = document.getElementById('email').value;
    resetpwBtn.disabled = true;
    resetpwBtn.innerText = "Sending...";
    console.log(auth, email)

    if (!emailInput) {
        showStatus("A email is required.", "error");
        resetpwBtn.disabled = false;
        resetpwBtn.innerText = "Forgot password?";
        return;
    }
    
    try {
        // Firebase method to send the reset link
        await FirebaseAuth.sendPasswordResetEmail(auth, emailInput);
        
        showStatus("Reset link sent! Please check your inbox. If it doesn't appear, check your spam.", "success");
        
    } catch (error) {
        console.error("Password Reset Error:", error.code);
        let message = "Failed to send reset email.";

        if (error.code === 'auth/user-not-found') {
            message = "No account found with this email.";
        } else if (error.code === 'auth/invalid-email') {
            message = "Please enter a valid email address.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Too many requests. Try again later.";
        }
        showStatus(message, "error");
    } finally {
        resetpwBtn.disabled = false;
        resetpwBtn.innerText = "Forgot password?";
    }
}

await auth.authStateReady();
const user = auth.currentUser;

if (user) {
    console.log("User already logged in, redirecting to dashboard...");
    window.location.replace("../dashboard/index.html"); 
} else {

}