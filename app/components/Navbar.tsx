import React from 'react'
import {Link} from "react-router";
import {usePuterStore} from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();
    
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">FirstImpress</p>
            </Link>
            <div className="flex gap-4 items-center">
                <Link to="/upload" className="primary-button px-4 py-2 text-center w-full sm:w-auto">
                    <p className="text-1xl font-semibold text-white">Upload Resume</p>
                </Link>
            </div>
        </nav>
    )
}
export default Navbar
