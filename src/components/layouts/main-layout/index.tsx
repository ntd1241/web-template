import { Helmet } from 'react-helmet-async';
import { LayoutProvider } from './components/context';
import { Wrapper } from './components/wrapper';

export function MainLayout() {
  return (
    <>
      <Helmet>
        <title>Admin Template</title>
      </Helmet>

      <LayoutProvider
        bodyClassName="bg-muted overflow-hidden"
        style={
          {
            '--sidebar-width': '280px',
            '--sidebar-collapsed-width': '56px',
            '--sidebar-menu-width': '224px',
            '--header-height': '64px',
            '--header-height-mobile': '64px',
          } as React.CSSProperties
        }
      >
        <Wrapper />
      </LayoutProvider>
    </>
  );
}
