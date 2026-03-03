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
const logoutBtn = document.getElementById('logout-btn');
const submitBtn = document.getElementById('submit')
const cancelBtn = document.getElementById('cancel')

changepwBtn.addEventListener('click', async () => {
    accountSettingsShow(1)
});
cancelBtn.addEventListener('click', async () => {
    accountSettingsShow()
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

async function handleChangePw() {
    const pw0 = document.getElementById('pw1').value;
    const pw1 = document.getElementById('pw1').value;
    const pw2 = document.getElementById('pw2').value;

    function getValidationError(pw0, pw1, pw2) {

    if (!pw0 || !pw1 || !pw2) return "All fields are required.";
    if (pw1.length < 6 || pw1.length > 100) return "Password must be at least 6~100 characters long.";
    if (pw1 !== pw2) return "Passwords do not match.";
    
    return null;
    
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