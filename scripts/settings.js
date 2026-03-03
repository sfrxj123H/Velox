// Import Firebase libraries directly from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import * as FirebaseAuth from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import * as Firestore from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Import your local config
import { firebaseConfig } from "./firebaseConfig.js";

// Initialize Firebase locally within this script
const app = initializeApp(firebaseConfig);
const auth = FirebaseAuth.getAuth(app);
const db = Firestore.getFirestore(app);

const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileUid = document.getElementById('profile-uid');
const changepwBtn = document.getElementById('changepw-btn');
const resetpwBtn = document.getElementById('resetpw-btn');
const logoutBtn = document.getElementById('logout-btn');
const cancelBtn = document.getElementById('cancel')
const submitBtn1 = document.getElementById('submit1');

changepwBtn.addEventListener('click', async () => {
    accountSettingsShow(1)
});
resetpwBtn.addEventListener('click', async () => {
    handlePasswordReset()
});
cancelBtn.addEventListener('click', async () => {
    accountSettingsShow()
});
submitBtn1.addEventListener('click', async () => {
    handleChangePw()
});

function accountSettingsShow(ord=0) {
    document.getElementById('accountSettings').style.display = 'none';
    document.getElementById('changepw').style.display = 'none';
    if (ord == 0) {
        document.getElementById('accountSettings').style.display = 'block';
    }
    else if (ord == 1) {
        document.getElementById('changepw').style.display = 'block';
    }
}

function showStatus(message, type) {
    let statusDiv = document.getElementById('status-message');
    if (statusDiv) {
        statusDiv.innerText = message;
        statusDiv.style.color = type === "error" ? "red" : "green";
        statusDiv.style.fontWeight = "bold";
        statusDiv.style.marginTop = "10px";
    }
}

function handleAuthError(error) {
    switch (error.code) {
        case 'auth/invalid-credential': return "Current password is incorrect.";
        case 'auth/invalid-email': return "Invalid new email format.";
        case 'auth/email-already-in-use': return "Email already in use.";
        case 'auth/requires-recent-login': return "Session expired. Log in again.";
        default: return "An error occurred. Try again.";
    }
}

async function handleChangePw() {
    var pw0 = document.getElementById('pw0').value;
    var pw1 = document.getElementById('pw1').value;
    var pw2 = document.getElementById('pw2').value;

    function getValidationError(pw0, pw1, pw2) {
        if (!pw0 || !pw1 || !pw2) return "All fields are required.";
        if (pw1.length < 6 || pw1.length > 100) return "Password must be at least 6~100 characters long.";
        if (pw1 !== pw2) return "Passwords do not match.";
        return null;
    }

    async function reauthenticate(currentPassword) {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in.");
        
        const credential = FirebaseAuth.EmailAuthProvider.credential(user.email, currentPassword);
        return await FirebaseAuth.reauthenticateWithCredential(user, credential);
    }

    const errorMsg = getValidationError(pw0, pw1, pw2)
    if (errorMsg) {
        showStatus(errorMsg, "error");
        return;
    }
    submitBtn1.disabled = true;
    submitBtn1.innerText = "Changing Password...";

    try {
        await reauthenticate(pw0);
        await FirebaseAuth.updatePassword(auth.currentUser, pw1);
        showStatus("Password updated successfully!", "success");
        
        // Clear fields
        pw0 = ""; pw1 = ""; pw2 = "";
        accountSettingsShow()
    } catch (error) {
        console.error(error);
        showStatus(handleAuthError(error), "error");
        submitBtn1.innerText = "Change Password";
    } finally {
        submitBtn1.disabled = false;
    }
}

async function handlePasswordReset() {
    resetpwBtn.disabled = true;
    resetpwBtn.innerText = "Sending...";
    console.log(auth, auth.currentUser.email)

    try {
        // Firebase method to send the reset link
        await FirebaseAuth.sendPasswordResetEmail(auth, auth.currentUser.email);
        
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
        resetpwBtn.innerText = "Reset Password";
    }
}

// Logic using the namespaces and instances initialized above
FirebaseAuth.onAuthStateChanged(auth, async (user) => {
    try {
        if (user) {
            profileEmail.innerText = user.email;
            profileUid.innerText = user.uid;

            // Fetch user profile from Firestore using Namespace
            const userDocRef = Firestore.doc(db, "users", user.uid);
            const userDoc = await Firestore.getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                profileName.innerText = userData.name || "User";
            } else {
                profileName.innerText = user.displayName || "User";
            }
        } else {
            // Redirect to login if session is not active
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Dashboard Auth Error:", error);
    }
});

// Logout logic using the namespace
logoutBtn.addEventListener('click', async () => {
    if (confirm("Are you sure you want to log out?")) {
        try {
            await FirebaseAuth.signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
        }
    }
});