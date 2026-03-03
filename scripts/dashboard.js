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

const loadingOverlay = document.getElementById('loading');
const userGreeting = document.getElementById('user-greeting');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileUid = document.getElementById('profile-uid');
const logoutBtn = document.getElementById('logout-btn');

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
                userGreeting.innerText = userData.name || "User";
                profileName.innerText = userData.name || "User";
            } else {
                userGreeting.innerText = user.displayName || "User";
                profileName.innerText = user.displayName || "User";
            }

            // Remove loading overlay
            loadingOverlay.style.display = 'none';
        } else {
            // Redirect to login if session is not active
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Dashboard Auth Error:", error);
        loadingOverlay.style.display = 'none';
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