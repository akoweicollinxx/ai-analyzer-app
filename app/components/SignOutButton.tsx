import React from 'react';
import { usePuterStore } from "~/lib/puter";

const SignOutButton = () => {
    const { auth } = usePuterStore();
    
    if (!auth.isAuthenticated) {
        return null;
    }
    
    return (
        <button 
            onClick={auth.signOut}
            className="fixed bottom-4 right-4 bg-white text-red-600 hover:text-red-800 
                       font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg 
                       transition-all duration-200 border border-gray-200"
        >
            Sign Out
        </button>
    );
};

export default SignOutButton;