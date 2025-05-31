import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { authActions } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleLoginComponent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const clientId = '525169556176-jfo2jpkugogi7p313du4ftd4uf15hjm5.apps.googleusercontent.com';

    const onSuccess = async (credentialResponse) => {
        console.log('Google login response:', credentialResponse);
        try {
            // Send the credential to your backend
            const response = await axios.post('https://task-management-2qxv.onrender.com/api/v1/user/google-login', {
                credential: credentialResponse.credential
            });

            console.log('Backend response:', response.data);

            if (response.data.token) {
                localStorage.setItem("id", response.data.id);
                localStorage.setItem("token", response.data.token);
                dispatch(authActions.login());
                navigate('/');
            } else {
                setError('No token received from server');
                console.error('No token in response:', response.data);
            }
        } catch (error) {
            console.error('Google login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(error.response.data?.message || 'Server error occurred');
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response from server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An error occurred while setting up the request.');
            }
        }
    };

    const onFailure = (error) => {
        console.error('Google login failure:', error);
        setError('Google login failed. Please try again.');
    };

    return (
        <div className="flex flex-col items-center mt-4">
            {error && (
                <div className="text-red-500 text-sm mb-2">
                    {error}
                </div>
            )}
            <GoogleLogin
                clientId={clientId}
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                render={renderProps => (
                    <button
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                        />
                        Sign in with Google
                    </button>
                )}
            />
        </div>
    );
};

export default GoogleLoginComponent; 