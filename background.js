chrome.alarms.onAlarm.addListener(function(alarm) {
    chrome.storage.sync.get({ reminders: [] }, function(data) {
      const task = data.reminders.find(reminder => reminder.note === alarm.name);
      
      if (task) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon128.png",
          title: "Reminder",
          message: `It's time for: ${task.note}`,
          priority: 2
        });
        
        // Do not remove the reminder from storage
        // This allows the reminder to persist even after it has been triggered
      }
    });
  });
  