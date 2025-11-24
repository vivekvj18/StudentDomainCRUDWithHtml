// ====== CONFIG ======
const API_BASE_URL = "http://localhost:8080";
const submitBtn = document.getElementById("loginButton");

// DOM loaded hone ke baad hi form listener attach karo
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("error-message");
    const submitBtn = document.getElementById("loginButton"); // <button id="loginButton">Login</button> rakho

    if (!loginForm) {
        console.error("❌ loginForm not found in DOM");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearError();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // ---- Basic validation ----
        if (!email || !password) {
            showError("⚠️ Please enter both email and password.");
            return;
        }

        // email format ka chhota sa check
        if (!email.includes("@")) {
            showError("⚠️ Please enter a valid email address.");
            return;
        }

        // ---- UI Loading State ON ----
        setLoading(true);

        const authString = btoa(email + ":" + password);

        try {
            const response = await fetch(`${API_BASE_URL}/api/domains`, {
                method: "GET",
                headers: {
                    "Authorization": "Basic " + authString,
                    "Accept": "application/json"
                }
            });

            // ---- Status handling ----
            if (response.ok) {
                // Optional: verify JSON aa raha hai
                // const domains = await response.json();
                // console.log("Domains:", domains);

                // Future requests ke liye token store kar lo (dashboard se use karenge)
                sessionStorage.setItem("authToken", authString);
                sessionStorage.setItem("authEmail", email);

                alert("✅ Login successful (Admin verified)!");
                window.location.href = "dashboard.html"; // Next UI page
            } else if (response.status === 401) {
                showError("❌ Invalid credentials. Please check email / password.");
            } else if (response.status === 403) {
                showError("⛔ Access denied. Only Admin department employees can login.");
            } else if (response.status >= 500) {
                showError("⚠️ Server error (status " + response.status + "). Please try again later.");
            } else {
                showError("⚠️ Unexpected error (status " + response.status + ").");
            }

        } catch (error) {
            console.error("Login error:", error);
            showError("⚠️ Unable to reach server. Is backend running on port 8080?");
        } finally {
            // ---- UI Loading State OFF ----
            setLoading(false);
        }
    });

    // Helper: show error
    function showError(msg) {
        if (errorBox) {
            errorBox.innerText = msg;
            errorBox.style.display = "block";
        } else {
            alert(msg);
        }
    }

    // Helper: clear error
    function clearError() {
        if (errorBox) {
            errorBox.innerText = "";
            errorBox.style.display = "none";
        }
    }

    // Helper: loading state
    function setLoading(isLoading) {
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Logging in...";
            submitBtn.classList.add("loading"); // CSS me spinner/opacity de sakte ho
        } else {
            submitBtn.disabled = false;
            submitBtn.innerText = "Login";
            submitBtn.classList.remove("loading");
        }
    }
});
