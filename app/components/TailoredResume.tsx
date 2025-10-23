import React, { useState } from 'react';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface TailoredResumeProps {
  tailoredResume: {
    content: string;
    summary: string;
    keyChanges: string[];
  };
}

const TailoredResume: React.FC<TailoredResumeProps> = ({ tailoredResume }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Convert markdown to HTML
  const resumeHtml = marked.parse(tailoredResume.content);
  
  const generatePDF = async () => {
    if (!tailoredResume.content) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create a temporary div to render the tailored resume content
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-tailored-resume';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '20px'; // Add padding for better spacing
      // Use responsive width based on device
      const isMobile = window.innerWidth < 768;
      tempDiv.style.width = isMobile ? '100%' : '800px'; // Responsive width for mobile
      
      // Add custom CSS to ensure clean styling for ATS compatibility with no design elements at the top
      const styleElement = document.createElement('style');
      styleElement.textContent = `
          #temp-tailored-resume h1 {
              color: #111827;
              background-color: transparent;
              margin-top: 12px;
              margin-bottom: 12px;
              padding: 0;
              font-size: ${isMobile ? '1.5em' : '1.8em'};
              text-align: left;
              font-weight: bold;
              width: 100%;
          }
          #temp-tailored-resume h2, 
          #temp-tailored-resume h3, 
          #temp-tailored-resume h4, 
          #temp-tailored-resume h5, 
          #temp-tailored-resume h6 {
              color: #111827;
              background-color: transparent;
              margin-top: 10px;
              margin-bottom: 8px;
              padding: 0;
              font-size: ${isMobile ? '1.1em' : '1.2em'};
              text-align: left;
              font-weight: 600;
              width: 100%;
          }
          #temp-tailored-resume * {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              margin: 4px 0;
              color: #333333;
              box-sizing: border-box;
          }
          #temp-tailored-resume {
              max-width: 100%;
              font-size: ${isMobile ? '10pt' : '11pt'};
              background-color: #ffffff;
              padding: ${isMobile ? '15px' : '20px'};
              margin: 0;
              width: 100%;
          }
          #temp-tailored-resume p {
              margin: 6px 0;
              width: 100%;
              word-wrap: break-word;
          }
          #temp-tailored-resume ul, #temp-tailored-resume ol {
              margin: 6px 0;
              padding-left: ${isMobile ? '15px' : '20px'};
              width: 100%;
          }
          #temp-tailored-resume li {
              margin: 4px 0;
              width: 100%;
              word-wrap: break-word;
          }
      `;
      document.head.appendChild(styleElement);
      
      // Convert markdown to HTML and add to the div
      const resumeHtml = marked.parse(tailoredResume.content);
      tempDiv.innerHTML = resumeHtml;
      document.body.appendChild(tempDiv);
      
      // Create a canvas from the temporary div
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions for the PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm (A4 height)
      const margin = 10; // margin in mm
      
      // Calculate the height of the image at full width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Convert the canvas to image data
      const imgData = canvas.toDataURL('image/png');
      
      // Scale content appropriately based on device type
      let scale;
      if (isMobile) {
        // For mobile: use a slightly different scaling approach to ensure content fits well
        scale = Math.min(1, (pageHeight - (margin * 2)) / imgHeight);
        // Adjust scale to ensure text is readable on mobile
        scale = Math.max(scale, 0.85);
      } else {
        // For desktop: standard scaling
        scale = Math.min(1, (pageHeight - (margin * 2)) / imgHeight);
      }
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Position content based on device type
      let xOffset, yOffset;
      
      if (isMobile) {
        // For mobile: align to left with margin for better readability
        xOffset = margin;
        yOffset = margin; // Top margin
      } else {
        // For desktop: center the content horizontally
        xOffset = (imgWidth - scaledWidth) / 2;
        yOffset = margin + 10; // Fixed top margin
      }
      
      // Add the image to the PDF
      pdf.addImage(
        imgData, 
        'PNG', 
        xOffset, // x position with centering
        yOffset, // y position with centering
        scaledWidth, // scaled width
        scaledHeight, // scaled height
        null, // alias
        'FAST' // compression
      );
      
      // Generate PDF as blob
      const pdfBlob = pdf.output('blob');
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = 'ats-friendly-resume.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      document.body.removeChild(tempDiv);
      document.head.removeChild(styleElement);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  return (
    <div className="tailored-resume-container bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Tailored Resume</h3>
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md transition-colors flex items-center justify-center text-sm sm:text-base"
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span className="whitespace-nowrap">Download ATS-Friendly Resume</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mb-6">
        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Summary of Changes</h4>
        <p className="text-sm sm:text-base text-gray-600">{tailoredResume.summary}</p>
      </div>
      
      <div className="mb-6">
        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Key Improvements</h4>
        <ul className="list-disc pl-5 text-sm sm:text-base text-gray-600">
          {tailoredResume.keyChanges.map((change, index) => (
            <li key={index} className="mb-1">{change}</li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-gray-200 pt-4 sm:pt-6">
        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Tailored Resume Preview</h4>
        <div 
          id="tailored-resume-content"
          className="tailored-resume-content bg-white border border-gray-300 rounded-md p-3 sm:p-6 shadow-inner overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: resumeHtml }}
        />
      </div>
    </div>
  );
};

export default TailoredResume;