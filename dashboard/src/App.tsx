import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/AppShell'
import { ClassifierPage } from '@/pages/ClassifierPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { InboxPage } from '@/pages/InboxPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<ClassifierPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
