function App() {
  const { notifications, removeNotification } = useSocket();

  return (
    <LanguageProvider>
      <CalendarSyncProvider>

        {/* Global offline indicator */}
        <OfflineBanner />

        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/agents" element={<MultiAgentChat />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health" element={<HealthProfile />} />
          <Route path="/addMedication" element={<MedicationEntryForm />} />
          <Route path="/oauth2callback" element={<OAuthCallback />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reportChat" element={<ReportChat />} />
          <Route path="/report-analysis" element={<ReportAnalysis />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        {/* Global notification toasts */}
        <NotificationContainer
          notifications={notifications}
          onRemoveNotification={removeNotification}
        />

      </CalendarSyncProvider>
    </LanguageProvider>
  );
}
