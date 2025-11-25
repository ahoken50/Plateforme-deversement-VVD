
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import Intervenants from './pages/Intervenants';
import Procedure from './pages/Procedure';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="report/new" element={<NewReport />} />
                    <Route path="report/:id" element={<NewReport />} />
                    <Route path="intervenants" element={<Intervenants />} />
                    <Route path="procedure" element={<Procedure />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
