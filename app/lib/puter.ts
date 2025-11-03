import { create } from "zustand";

declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>;
                isSignedIn: () => Promise<boolean>;
                signIn: () => Promise<void>;
                signOut: () => Promise<void>;
            };
            fs: {
                write: (
                    path: string,
                    data: string | File | Blob
                ) => Promise<File | undefined>;
                read: (path: string) => Promise<Blob>;
                upload: (file: File[] | Blob[]) => Promise<FSItem>;
                delete: (path: string) => Promise<void>;
                readdir: (path: string) => Promise<FSItem[] | undefined>;
            };
            ai: {
                chat: (
                    prompt: string | ChatMessage[],
                    imageURL?: string | PuterChatOptions,
                    testMode?: boolean,
                    options?: PuterChatOptions
                ) => Promise<Object>;
                img2txt: (
                    image: string | File | Blob,
                    testMode?: boolean
                ) => Promise<string>;
            };
            kv: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<boolean>;
                delete: (key: string) => Promise<boolean>;
                list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
                flush: () => Promise<boolean>;
            };
        };
    }
}

interface PuterStore {
    isLoading: boolean;
    error: string | null;
    puterReady: boolean;
    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getUser: () => PuterUser | null;
    };
    fs: {
        write: (
            path: string,
            data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };
    ai: {
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => Promise<AIResponse | undefined>;
        feedback: (
            path: string,
            message: string
        ) => Promise<AIResponse | undefined>;
        img2txt: (
            image: string | File | Blob,
            testMode?: boolean
        ) => Promise<string | undefined>;
    };
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | undefined>;
        flush: () => Promise<boolean | undefined>;
    };

    init: () => void;
    clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {
    const setError = (msg: string) => {
        set({
            error: msg,
            isLoading: false,
            auth: {
                user: null,
                isAuthenticated: false,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: get().auth.getUser,
            },
        });
    };


    const checkAuthStatus = async (): Promise<boolean> => {
        // Always return true with a mocked user to bypass authentication
        const mockUser = { username: 'guest', email: 'guest@example.com' } as PuterUser;
        
        set({
            auth: {
                user: mockUser,
                isAuthenticated: true,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: () => mockUser,
            },
            isLoading: false,
            error: null
        });
        
        return true;
    };

    const signIn = async (): Promise<void> => {
        // Bypass actual Puter authentication and just set mock authenticated state
        const mockUser = { username: 'guest', email: 'guest@example.com' } as PuterUser;
        
        set({
            auth: {
                user: mockUser,
                isAuthenticated: true,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: () => mockUser,
            },
            isLoading: false,
            error: null
        });
    };

    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isLoading: true, error: null });

        try {
            await puter.auth.signOut();
            set({
                auth: {
                    user: null,
                    isAuthenticated: false,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => null,
                },
                isLoading: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign out failed";
            setError(msg);
        }
    };

    const refreshUser = async (): Promise<void> => {
        // Use mock user instead of fetching from Puter
        const mockUser = { username: 'guest', email: 'guest@example.com' } as PuterUser;
        
        set({
            auth: {
                user: mockUser,
                isAuthenticated: true,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getUser: () => mockUser,
            },
            isLoading: false,
            error: null
        });
    };

    const init = (): void => {
        const puter = getPuter();
        if (puter) {
            set({ 
                puterReady: true,
                auth: {
                    // Mock authenticated user to prevent auth popups
                    user: { username: 'guest', email: 'guest@example.com' } as PuterUser,
                    isAuthenticated: true,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getUser: () => ({ username: 'guest', email: 'guest@example.com' } as PuterUser),
                }
            });
            return;
        }

        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ 
                    puterReady: true,
                    auth: {
                        // Mock authenticated user to prevent auth popups
                        user: { username: 'guest', email: 'guest@example.com' } as PuterUser,
                        isAuthenticated: true,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getUser: () => ({ username: 'guest', email: 'guest@example.com' } as PuterUser),
                    }
                });
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            if (!getPuter()) {
                setError("Puter.js failed to load within 10 seconds");
            }
        }, 10000);
    };

    const write = async (path: string, data: string | File | Blob) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.fs.write(path, data);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("File write operation attempted without authentication");
            return undefined;
        }
    };

    const readDir = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.fs.readdir(path);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("Directory read operation attempted without authentication");
            return [];
        }
    };

    const readFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.fs.read(path);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("File read operation attempted without authentication");
            return undefined;
        }
    };

    const upload = async (files: File[] | Blob[]) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.fs.upload(files);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("File upload operation attempted without authentication");
            return undefined;
        }
    };

    const deleteFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.fs.delete(path);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("File delete operation attempted without authentication");
            return;
        }
    };

    const chat = async (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            // return puter.ai.chat(prompt, imageURL, testMode, options);
            return await puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
                AIResponse | undefined
            >;
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("AI chat operation attempted without authentication");
            return undefined;
        }
    };

    const feedback = async (path: string, message: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        // Create a promise that rejects after a timeout
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise<AIResponse | undefined>((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error("Analysis timed out after 3 minutes. Please try again."));
            }, 180000); // 3 minutes timeout
        });

        try {
            // Race between the AI chat and the timeout
            return await Promise.race([
                puter.ai.chat(
                    [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "file",
                                    puter_path: path,
                                },
                                {
                                    type: "text",
                                    text: message,
                                },
                            ],
                        },
                    ],
                    { model: "claude-3-7-sonnet" }
                ) as Promise<AIResponse | undefined>,
                timeoutPromise
            ]);
        } catch (error) {
            console.error("AI analysis error:", error);
            // If error is due to authentication, provide a more specific message
            if (error instanceof Error && error.message.includes("auth")) {
                console.log("AI feedback operation attempted without authentication");
            } else {
                setError(error instanceof Error ? error.message : "Analysis failed");
            }
            return undefined;
        }
    };

    const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.ai.img2txt(image, testMode);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("AI image-to-text operation attempted without authentication");
            return undefined;
        }
    };

    const getKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.kv.get(key);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("KV get operation attempted without authentication");
            return null;
        }
    };

    const setKV = async (key: string, value: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.kv.set(key, value);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("KV set operation attempted without authentication");
            return false;
        }
    };

    const deleteKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.kv.delete(key);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("KV delete operation attempted without authentication");
            return false;
        }
    };

    const listKV = async (pattern: string, returnValues?: boolean) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        if (returnValues === undefined) {
            returnValues = false;
        }
        try {
            return await puter.kv.list(pattern, returnValues);
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("KV list operation attempted without authentication");
            return [];
        }
    };

    const flushKV = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        try {
            return await puter.kv.flush();
        } catch (error) {
            // If error is due to authentication, silently handle it
            console.log("KV flush operation attempted without authentication");
            return false;
        }
    };

    return {
        isLoading: false,
        error: null,
        puterReady: true,
        auth: {
            // Mock authenticated user in initial state
            user: { username: 'guest', email: 'guest@example.com' } as PuterUser,
            isAuthenticated: true,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser: () => ({ username: 'guest', email: 'guest@example.com' } as PuterUser),
        },
        fs: {
            write: (path: string, data: string | File | Blob) => write(path, data),
            read: (path: string) => readFile(path),
            readDir: (path: string) => readDir(path),
            upload: (files: File[] | Blob[]) => upload(files),
            delete: (path: string) => deleteFile(path),
        },
        ai: {
            chat: (
                prompt: string | ChatMessage[],
                imageURL?: string | PuterChatOptions,
                testMode?: boolean,
                options?: PuterChatOptions
            ) => chat(prompt, imageURL, testMode, options),
            feedback: (path: string, message: string) => feedback(path, message),
            img2txt: (image: string | File | Blob, testMode?: boolean) =>
                img2txt(image, testMode),
        },
        kv: {
            get: (key: string) => getKV(key),
            set: (key: string, value: string) => setKV(key, value),
            delete: (key: string) => deleteKV(key),
            list: (pattern: string, returnValues?: boolean) =>
                listKV(pattern, returnValues),
            flush: () => flushKV(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});