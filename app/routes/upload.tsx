import { type FormEvent, useState} from "react";
import Navbar from "../components/Navbar";
import FileUploader from "../components/FileUploader";
import {usePuterStore} from "../lib/puter";
import {useNavigate} from "react-router";
import {generateUUID} from "../lib/utils";
import {prepareInstructions, AIResponseFormat} from "../../constants";

const Upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }
    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setIsProcessing(true);
        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) {
            setStatusText('Error: Failed to upload file');
            setTimeout(() => setIsProcessing(false), 3000);
            return;
        }

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        
        // Set up a timer to update status text periodically to show progress
        let analysisTime = 0;
        const statusInterval = setInterval(() => {
            analysisTime += 10;
            if (analysisTime < 60) {
                setStatusText(`Analyzing... (${analysisTime} seconds)`);
            } else {
                const minutes = Math.floor(analysisTime / 60);
                const seconds = analysisTime % 60;
                setStatusText(`Analyzing... (${minutes}m ${seconds}s) - This may take a few minutes for complex resumes`);
            }
        }, 10000); // Update every 10 seconds
        
        try {
            setStatusText('Analyzing... This may take a few minutes');
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({AIResponseFormat, jobTitle, jobDescription })
            );
            
            clearInterval(statusInterval);
            
            if (!feedback) {
                setStatusText('Error: Analysis failed. Please try again.');
                setTimeout(() => setIsProcessing(false), 3000);
                return;
            }
            
            const feedbackText = typeof feedback.message.content === 'string' 
                ? feedback.message.content 
                : feedback.message.content[0].text;

            try {
                data.feedback = JSON.parse(feedbackText);
                await kv.set(`resume:${uuid}`, JSON.stringify(data));
                setStatusText('Analysis complete, redirecting...');
                console.log(data);
                navigate(`/resume/${uuid}`);
            } catch (parseError) {
                console.error('Error parsing feedback:', parseError);
                setStatusText('Error: Could not process AI response. Please try again.');
                setTimeout(() => setIsProcessing(false), 3000);
            }
        } catch (error) {
            clearInterval(statusInterval);
            console.error('Analysis error:', error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'Analysis failed. Please try again.'}`);
            setTimeout(() => setIsProcessing(false), 5000);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({companyName, jobTitle, jobDescription, file})

    }
    return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />

        <section className="main-section">
            <div className="page-heading py-16">
               <h1>Your Resume, Optimized for Success</h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" alt="loading" className="w-full"/>
                        <button 
                            onClick={() => {
                                setIsProcessing(false);
                                setStatusText('');
                            }}
                            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel Analysis
                        </button>
                    </>
                ) : (
                    <h2>Upload your resume and job description to get an ATS analysis and a new tailored resume</h2>
                )}
                {!isProcessing && (
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                        <div className="form-div">
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                        </div>

                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume</label>
                            <FileUploader onFileSelect={handleFileSelect} />
                        </div>

                        <button className="primary-button" type="submit">
                            Generate Tailored Resume
                        </button>
                    </form>
                )}
            </div>
        </section>
    </main>
    )
}
// @ts-ignore
export default Upload
