document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        // Maak deelnemerslijst met delete-knop
        let participantsList = '';
        if (details.participants.length > 0) {
          participantsList = details.participants.map(p =>
            `<li style="list-style-type:none;display:flex;align-items:center;gap:6px;">
              <span>${p}</span>
              <button class="delete-participant-btn" data-activity="${encodeURIComponent(name)}" data-participant="${encodeURIComponent(p)}" title="Verwijder deelnemer" style="background:none;border:none;cursor:pointer;font-size:1em;">🗑️</button>
            </li>`
          ).join('');
        } else {
          participantsList = '<li style="list-style-type:none;"><em>No participants yet</em></li>';
        }
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            <ul class="participants-list" style="padding-left:0;">
              ${participantsList}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Voeg event listeners toe aan delete-knoppen
        setTimeout(() => {
          activityCard.querySelectorAll('.delete-participant-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const activityName = decodeURIComponent(btn.getAttribute('data-activity'));
              const participant = decodeURIComponent(btn.getAttribute('data-participant'));
              if (confirm(`Weet je zeker dat je ${participant} wilt verwijderen uit ${activityName}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participant)}`, { method: 'POST' });
                  if (response.ok) {
                    fetchActivities();
                  } else {
                    alert('Verwijderen mislukt.');
                  }
                } catch (err) {
                  alert('Netwerkfout bij verwijderen.');
                }
              }
            });
          });
        }, 0);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
