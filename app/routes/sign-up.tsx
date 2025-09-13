import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";

export const meta = () => ([
    { title: 'FirstImpress | Sign Up' },
    { name: 'description', content: 'Create a new account' },
])

const SignUpPage = () => {
    const navigate = useNavigate();
    const { isLoading, auth } = usePuterStore();
    
    useEffect(() => {
        if(auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth.isAuthenticated, navigate]);
    
    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Create an Account to Start Your Job Journey</h2>
                    </div>
                    <div>
                        {isLoading ? (
                            <button className="auth-button animate-pulse">
                                <p>Signing you up...</p>
                            </button>
                        ) : (
                            <>
                                {auth.isAuthenticated ? (
                                    <button className="auth-button" onClick={auth.signOut}>
                                        <p>Log Out</p>
                                    </button>
                                ) : (
                                    <button className="auth-button" onClick={auth.signIn}>
                                        <p>Sign Up with Puter</p>
                                    </button>
                                )}
                            </>
                        )}
                        <div className="mt-4 text-center">
                            <p>Already have an account? <a href="/sign-in" className="text-blue-600 hover:underline">Sign In</a></p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default SignUpPage;