---
name: Feature Request - Notification Snooze
about: Add snooze functionality to medication reminders
title: "[FEATURE] Add Snooze Functionality to Medication Reminders"
labels: enhancement, medication, notifications, user-experience
assignees: ""
---

## 🚀 Feature Request: Medication Reminder Snooze

### **Problem**

Users need to snooze medication reminders when they can't take medication immediately, improving adherence through flexible timing.

### **Solution**

Add snooze functionality with:

- **4 duration options**: 5min, 15min, 30min, 1hr
- **Max 3 snoozes** per notification
- **Persistent state** across server restarts
- **Visual feedback** showing snooze status

### **User Flow**

```
Reminder → Click "Snooze" → Select duration → Wait → Re-triggered notification
```

### **Acceptance Criteria**

- [ ] Snooze buttons in notification toast
- [ ] Four duration options available
- [ ] Maximum 3 snoozes enforced
- [ ] Snooze counter display (e.g., "2/3 used")
- [ ] State persists across restarts
- [ ] No snooze on test notifications

### **Technical Requirements**

- [ ] Database schema updates (`isSnoozed`, `snoozeUntil`, `snoozeCount`)
- [ ] API endpoints (`/snooze`, `/check-snoozed`)
- [ ] Socket.IO integration
- [ ] Timer scheduling logic

### **Priority**: High 🔥

---

**Impact**: Improves medication adherence through flexible reminder timing
