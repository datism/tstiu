import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TestsList from './components/TestsList';
import TestPreview from './components/TestPreview';
import TestWizard from './components/TestWizard';

export default function App() {
  return (
    <BrowserRouter basename='/tstiu/'>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TestsList />} />
          <Route path="/test/:id" element={<TestPreview />} />
          <Route path="/new-test" element={<TestWizard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}