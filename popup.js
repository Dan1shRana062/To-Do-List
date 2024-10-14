// Initialize an empty array for reminders
let reminders = [];

// Function to render reminders in the list
function renderReminders() {
    const reminderList = document.getElementById('reminderList');
    reminderList.innerHTML = ''; // Clear the current list
    
    reminders.forEach((task) => {
        const li = document.createElement('li');
        const reminderTime = new Date(task.time);
        const isPast = reminderTime < new Date(); // Check if the reminder is in the past

        li.textContent = `${task.note} at ${reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        if (isPast) {
            li.style.color = "gray"; // Optional styling for past reminders
            li.style.textDecoration = "line-through"; // Cross out past reminders
        }

        reminderList.appendChild(li);
    });
}

// Function to display reminders from storage
function displayReminders() {
    chrome.storage.sync.get({ reminders: [] }, function(data) {
        reminders = data.reminders; // Load reminders from storage
        renderReminders(); // Render loaded reminders
    });
}

// Function to set an alarm for a task
function setAlarm(task) {
    const alarmTime = new Date(task.time).getTime();
    chrome.alarms.create(task.note, { when: alarmTime });
}

// Add event listener for the form submission
document.getElementById('reminderForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const reminderNote = document.getElementById("reminder").value; // Match with your input field ID
    const reminderTime = document.getElementById("reminderTime").value;

    if (reminderNote && reminderTime) {
        const currentDateTime = new Date();
        const [hours, minutes] = reminderTime.split(":").map(Number);
        const reminderDateTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate(), hours, minutes);

        if (reminderDateTime < currentDateTime) {
            reminderDateTime.setDate(reminderDateTime.getDate() + 1); // Schedule for the next day if the time is in the past
        }

        const task = { note: reminderNote, time: reminderDateTime.toISOString() };

        // Store the reminder
        chrome.storage.sync.get({ reminders: [] }, function(data) {
            reminders = data.reminders;
            reminders.push(task);

            // Keep only the last 10 reminders
            if (reminders.length > 10) {
                reminders = reminders.slice(reminders.length - 10);
            }

            chrome.storage.sync.set({ reminders: reminders }, function() {
                setAlarm(task);
                renderReminders(); // Update displayed reminders
                document.getElementById("reminderForm").reset(); // Clear the form
            });
        });
    }
});

// Clear all reminders
document.getElementById("clearAll").addEventListener("click", function() {
    chrome.storage.sync.set({ reminders: [] }, function() {
        reminders = []; // Clear the reminders array
        renderReminders(); // Update the displayed list
        chrome.alarms.clearAll(); // Clear all alarms
    });
});

// Load reminders on DOM content loaded
document.addEventListener("DOMContentLoaded", displayReminders);
