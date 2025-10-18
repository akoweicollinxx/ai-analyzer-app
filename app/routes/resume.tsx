import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "../lib/puter";
import Summary from "../components/Summary";
import ATS from "../components/ATS";
import Details from "../components/Details";
import TailoredResume from "../components/TailoredResume";
import "../styles/responsive-resume.css";

export const meta = () => ([
    { title: "FirstImpress" },
    { name: "description", content: "Smart AI resume generator tailored to every job!" },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    // Authentication check removed to allow direct access to resume page
    // useEffect(() => {
    //     if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    // }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data = JSON.parse(resume);
            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);
            setFeedback(data.feedback);

            console.log({ resumeUrl, feedback: data.feedback });
        };

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav p-4 sm:p-6">
                <Link to="/" className="back-button flex items-center gap-2">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
                </Link>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row w-full">
                {/* Resume Preview & Download Section */}
                <section className="feedback-section bg-gray-50 h-auto md:h-[100vh] sticky top-0 items-center justify-center p-4">
                    {resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-auto md:h-[90%] w-full md:w-fit flex flex-col items-center">
                            <iframe
                                src={resumeUrl}
                                className="w-full h-full object-contain rounded-2xl"
                                title="resume"
                                style={{ height: "80vh", width: "100%" }}
                            />

                            <button
                                onClick={async () => {
                                    if (!feedback?.tailoredResume?.content) {
                                        // fallback to original resume if tailored not found
                                        const downloadLink = document.createElement("a");
                                        downloadLink.href = resumeUrl;
                                        downloadLink.download = "tailored_resume.pdf";
                                        document.body.appendChild(downloadLink);
                                        downloadLink.click();
                                        document.body.removeChild(downloadLink);
                                        return;
                                    }

                                    // Temporary div for rendering tailored resume
                                    const tempDiv = document.createElement("div");
                                    tempDiv.id = "temp-tailored-resume";
                                    tempDiv.style.position = "absolute";
                                    tempDiv.style.left = "-9999px";
                                    tempDiv.style.backgroundColor = "#ffffff";
                                    tempDiv.style.padding = "20px";
                                    tempDiv.style.width = "800px"; // A4 width

                                    // Clean minimal ATS-friendly styling
                                    const styleElement = document.createElement("style");
                                    styleElement.textContent = `
                    #temp-tailored-resume h1 {
                      color: #111827;
                      margin: 12px 0;
                      font-size: 1.8em;
                      font-weight: bold;
                      text-align: left;
                    }
                    #temp-tailored-resume h2, h3, h4, h5, h6 {
                      color: #111827;
                      margin: 10px 0 8px 0;
                      font-size: 1.2em;
                      font-weight: 600;
                      text-align: left;
                    }
                    #temp-tailored-resume * {
                      font-family: Arial, sans-serif;
                      line-height: 1.4;
                      margin: 4px 0;
                      color: #333333;
                    }
                    #temp-tailored-resume {
                      font-size: 11pt;
                      background-color: #ffffff;
                      padding: 20px;
                    }
                    #temp-tailored-resume p {
                      margin: 6px 0;
                    }
                    #temp-tailored-resume ul, #temp-tailored-resume ol {
                      margin: 6px 0;
                      padding-left: 20px;
                    }
                    #temp-tailored-resume li {
                      margin: 4px 0;
                    }
                  `;
                                    document.head.appendChild(styleElement);

                                    // Convert markdown → HTML
                                    const marked = (await import("marked")).marked;
                                    const resumeHtml = marked.parse(feedback.tailoredResume.content);
                                    tempDiv.innerHTML = resumeHtml;
                                    document.body.appendChild(tempDiv);

                                    try {
                                        // Convert HTML → PDF
                                        const html2canvas = (await import("html2canvas")).default;
                                        const jsPDF = (await import("jspdf")).jsPDF;

                                        const canvas = await html2canvas(tempDiv, {
                                            scale: 2,
                                            useCORS: true,
                                            logging: false,
                                            backgroundColor: "#ffffff",
                                        });

                                        const pdf = new jsPDF({
                                            orientation: "portrait",
                                            unit: "mm",
                                            format: "a4",
                                        });

                                        const imgWidth = 210; // A4 width mm
                                        const pageHeight = 297; // A4 height mm
                                        const margin = 10;

                                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                        const imgData = canvas.toDataURL("image/png");

                                        const scale = Math.min(1, (pageHeight - margin * 2) / imgHeight);
                                        const scaledWidth = imgWidth * scale;
                                        const scaledHeight = imgHeight * scale;

                                        const xOffset = (imgWidth - scaledWidth) / 2;
                                        const yOffset = margin + 10;

                                        pdf.addImage(imgData, "PNG", xOffset, yOffset, scaledWidth, scaledHeight, null, "FAST");
                                        pdf.save("tailored_resume.pdf");
                                    } catch (error) {
                                        console.error("Error generating PDF:", error);
                                        alert("Failed to generate PDF. Downloading original resume instead.");

                                        const downloadLink = document.createElement("a");
                                        downloadLink.href = resumeUrl;
                                        downloadLink.download = "tailored_resume.pdf";
                                        document.body.appendChild(downloadLink);
                                        downloadLink.click();
                                        document.body.removeChild(downloadLink);
                                    } finally {
                                        document.body.removeChild(tempDiv);
                                        document.head.removeChild(styleElement);
                                    }
                                }}
                                className="mt-4 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold text-base sm:text-lg shadow-md"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="flex-shrink-0"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                <span className="whitespace-nowrap">Download ATS-Friendly Resume</span>
                            </button>
                        </div>
                    )}
                </section>

                {/* Feedback Section */}
                <section className="feedback-section p-4 sm:p-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl !text-black font-bold mb-4 sm:mb-6">
                        Tailored Resume & Analysis
                    </h2>

                    {feedback ? (
                        <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-1000">
                            {feedback.tailoredResume && (
                                <TailoredResume tailoredResume={feedback.tailoredResume} />
                            )}
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <img src="/images/resume-scan-2.gif" className="w-full max-w-md mx-auto" />
                            <p className="text-sm sm:text-base text-gray-600 mt-4 text-center">
                                Analyzing your resume... This may take a few minutes for complex resumes.
                                <br />
                                If analysis takes longer than 3 minutes, please try again.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
