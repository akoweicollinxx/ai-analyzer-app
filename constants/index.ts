export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },


];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      tailoredResume: {
        content: string; // The full content of the tailored resume in markdown format
        summary: string; // A brief summary of the changes made to tailor the resume
        keyChanges: string[]; // List of key changes made to tailor the resume
      };
    }`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                        AIResponseFormat,
                                    }: {
    jobTitle: string;
    jobDescription: string;
    AIResponseFormat: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System), resume analysis, and resume writing.
  Your task is to:
  1. Analyze and rate the uploaded resume
  2. Generate a completely new, tailored resume that is optimized for the provided job description
  
  For the analysis part:
  - Rate the resume thoroughly and provide detailed feedback
  - Point out any mistakes or areas for improvement
  - If there is a lot to improve, don't hesitate to give low scores
  - Take the job description into consideration for your analysis
  
  For the tailored resume part:
  - Create a completely new resume based on the content from the original resume
  - Tailor it specifically to match the job description and highlight relevant skills/experience
  - Use a professional, ATS-friendly format that will pass through Applicant Tracking Systems
  - Strategically incorporate relevant keywords from the job description throughout the resume
  - Ensure the resume has a clear, scannable structure with appropriate section headings
  - Use industry-standard terminology that matches what recruiters are looking for
  - Quantify achievements where possible to demonstrate impact
  - Maintain truthfulness - don't invent new experiences or skills not mentioned in the original resume
  - Format the content in markdown for easy conversion to PDF
  - Provide a brief summary of the changes you made
  - List key improvements in the tailoredResume.keyChanges array
  
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  
  Provide the feedback and tailored resume using the following format: ${AIResponseFormat}
  Return the complete response as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;