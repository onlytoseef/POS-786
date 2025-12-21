import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }
        if (!password.trim()) {
            toast.error('Please enter your password');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.token) {
                login(response.data.token);
                toast.success('Welcome back! Login successful');
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data;
            if (typeof errorMsg === 'string') {
                toast.error(errorMsg);
            } else if (errorMsg?.message) {
                toast.error(errorMsg.message);
            } else if (err.code === 'ERR_NETWORK') {
                toast.error('Cannot connect to server. Please check if the server is running.');
            } else {
                toast.error('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#EBE0C0' }}>
            <div className="p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border-2" style={{ backgroundColor: '#242A2A', borderColor: '#D4C9A8' }}>
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold" style={{ backgroundColor: '#EBE0C0', color: '#242A2A' }}>786</div>
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#EBE0C0' }}>Spare Parts Manager</h2>
                    <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@test.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                    />
                    <Button type="submit" className="w-full mt-6" style={{ backgroundColor: '#EBE0C0', color: '#242A2A' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
                <p className="text-center mt-6 text-sm" style={{ color: '#9CA3AF' }}>
                    Tractor Spare Parts Business Management
                </p>
            </div>
        </div>
    );
};

export default Login;
