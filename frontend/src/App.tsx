import { RouterProvider } from '@tanstack/react-router'
import { LanguageProvider } from './providers/LanguageProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { router } from './router'

export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </LanguageProvider>
  )
}
