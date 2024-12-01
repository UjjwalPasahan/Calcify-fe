
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Home from './Components/Home.jsx';

const paths = [
  {
    path: '/',
    element: <Home />,
    errorElement: <div>Something went wrong!</div>
  },
];

const BrowserRouter = createBrowserRouter(paths);

const App = () => {
  return (
    <MantineProvider>
      <Notifications position="top-right" zIndex={1000} />
      <RouterProvider router={BrowserRouter} />
    </MantineProvider>
  );
};

export default App;