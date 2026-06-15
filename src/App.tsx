import { AppRouting } from '@/routing/app-routing';
import { AppProviders } from '@/providers/app-providers';

export function App() {
  return (
    <AppProviders>
      <AppRouting />
    </AppProviders>
  );
}
