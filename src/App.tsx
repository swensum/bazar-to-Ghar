import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './auth/authpage';
import VerifyEmailAction from './utils/VerifyEmailAction';
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/verify-email" element={<VerifyEmailAction />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;