
import { firebaseConfig } from "./firebaseConfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import * as FirebaseAuth from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import * as Firestore from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = FirebaseAuth.getAuth(app);
const db = Firestore.getFirestore(app);

/**
 * Validates the signup form:
 */
function getValidationError(name, email, pw1, pw2) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !pw1 || !pw2) return "All fields are required.";
    if (name.length > 50) return "Name must not be more than 50 characters long.";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (pw1.length < 6 || pw1.length > 100) return "Password must be at least 6~100 characters long.";
    if (pw1 !== pw2) return "Passwords do not match.";
    
    return null;
}

async function handleSignUp() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const pw1Input = document.getElementById('pw1');
    const pw2Input = document.getElementById('pw2');
    const submitBtn = document.getElementById('submit');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const pw1 = pw1Input.value;
    const pw2 = pw2Input.value;

    // Check custom conditions
    const errorMsg = getValidationError(name, email, pw1, pw2);
    if (errorMsg) {
        showStatus(errorMsg, "error");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Creating account...";

    try {
        // 1. Create User using Namespace
        const userCredential = await FirebaseAuth.createUserWithEmailAndPassword(auth, email, pw1);
        const user = userCredential.user;

        // 2. Save profile to Firestore with Server Timestamp
        await Firestore.setDoc(Firestore.doc(db, 'users', user.uid), {
            name: name,
            email: user.email,
            createdAt: Firestore.serverTimestamp(),
        });

        showStatus("Account created! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "../dashboard/index.html";
        }, 1500);

    } catch (error) {
        console.error("Signup error:", error.code);
        let friendlyMessage = "An error occurred during signup.";
        
        if (error.code === 'auth/email-already-in-use') friendlyMessage = "This email is already registered.";
        if (error.code === 'auth/weak-password') friendlyMessage = "The password provided is too weak.";
        if (error.code === 'auth/invalid-email') friendlyMessage = "The email address is invalid.";
        
        showStatus(friendlyMessage, "error");
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign Up";
    }
}

/**
 * UI Feedback helper
 */
function showStatus(message, type) {
    let statusDiv = document.getElementById('status-message');
    if (statusDiv) {
        statusDiv.innerText = message;
        statusDiv.style.color = type === "error" ? "red" : "green";
        statusDiv.style.fontWeight = "bold";
        statusDiv.style.marginTop = "10px";
    }
}

const submitBtn = document.getElementById('submit');
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSignUp();
});
