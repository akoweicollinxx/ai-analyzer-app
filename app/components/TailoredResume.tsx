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
      // Set a fixed width that works well for PDF generation regardless of device
      tempDiv.style.width = '800px'; 
      tempDiv.style.maxWidth = '100%';
      
      // Add custom CSS to ensure clean styling for ATS compatibility with no design elements at the top
      const styleElement = document.createElement('style');
      styleElement.textContent = `
          #temp-tailored-resume h1 {
              color: #111827;
              background-color: transparent;
              margin-top: 8px;
              margin-bottom: 10px;
              padding: 0;
              font-size: ${isMobile ? '1.5em' : '1.8em'};
              text-align: left;
              font-weight: bold;
              width: 100%;
              page-break-after: avoid;
          }
          #temp-tailored-resume h2, 
          #temp-tailored-resume h3, 
          #temp-tailored-resume h4, 
          #temp-tailored-resume h5, 
          #temp-tailored-resume h6 {
              color: #111827;
              background-color: transparent;
              margin-top: 8px;
              margin-bottom: 6px;
              padding: 0;
              font-size: ${isMobile ? '1.2em' : '1.3em'};
              text-align: left;
              font-weight: 600;
              width: 100%;
              page-break-after: avoid;
          }
          #temp-tailored-resume * {
              font-family: Arial, sans-serif;
              line-height: 1.3;
              margin: 3px 0;
              color: #333333;
              box-sizing: border-box;
          }
          /* Page break controls */
          #temp-tailored-resume section {
              page-break-inside: avoid;
          }
          #temp-tailored-resume .page-break {
              page-break-before: always;
          }
          #temp-tailored-resume .no-break {
              page-break-inside: avoid;
          }
          #temp-tailored-resume {
              max-width: 100%;
              font-size: ${isMobile ? '11pt' : '12pt'};
              background-color: #ffffff;
              padding: ${isMobile ? '8px' : '12px'};
              margin: 0;
              width: 100%;
              box-sizing: border-box;
              overflow: hidden;
          }
          #temp-tailored-resume p {
              margin: 3px 0;
              width: 100%;
              word-wrap: break-word;
              text-align: justify;
          }
          #temp-tailored-resume ul, #temp-tailored-resume ol {
              margin: 3px 0;
              padding-left: ${isMobile ? '12px' : '15px'};
              width: 100%;
          }
          #temp-tailored-resume li {
              margin: 1px 0;
              width: 100%;
              word-wrap: break-word;
              text-align: justify;
          }
          #temp-tailored-resume a {
              color: #2563eb;
              text-decoration: none;
          }
          #temp-tailored-resume table {
              width: 100%;
              border-collapse: collapse;
              margin: 5px 0;
          }
          #temp-tailored-resume td, #temp-tailored-resume th {
              padding: 3px;
              border: 1px solid #ddd;
          }
      `;
      document.head.appendChild(styleElement);
      
      // Convert markdown to HTML and add to the div
      const resumeHtml = marked.parse(tailoredResume.content);
      tempDiv.innerHTML = resumeHtml;
      document.body.appendChild(tempDiv);
      
      // Create a canvas from the temporary div with improved settings
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800, // Match the width we set for the temp div
        windowHeight: tempDiv.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure the cloned document has proper dimensions
          const clonedDiv = clonedDoc.getElementById('temp-tailored-resume');
          if (clonedDiv) {
            clonedDiv.style.width = '800px';
            clonedDiv.style.height = 'auto';
            clonedDiv.style.overflow = 'hidden';
          }
        }
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
      const margin = 5; // Small margin for better appearance
      
      // Calculate the height of the image at full width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Convert the canvas to image data
      const imgData = canvas.toDataURL('image/png');
      
      // Improved scaling logic that works consistently across all devices
      // Calculate available space (accounting for margins)
      const availableHeight = pageHeight - (margin * 2);
      
      // Determine if content needs scaling
      const needsScaling = imgHeight > availableHeight;
      
      // Calculate scale factor - if content fits, use 1, otherwise scale down proportionally
      const scale = needsScaling ? availableHeight / imgHeight : 1;
      
      // Apply scale with a small reduction to ensure no overflow
      const safeScale = scale * 0.98;
      
      // Calculate final dimensions
      const scaledWidth = imgWidth - (margin * 2);
      const scaledHeight = imgHeight * safeScale;
      
      // Center content on page
      const xOffset = margin;
      const yOffset = needsScaling ? margin : (pageHeight - scaledHeight) / 2;
      
      // Check if content exceeds a single page
      const contentExceedsPage = scaledHeight > pageHeight;
      
      if (contentExceedsPage) {
        // For multi-page content, use a different approach
        let remainingHeight = imgHeight;
        let currentPosition = 0;
        
        // Process each page
        while (remainingHeight > 0) {
          // Add image for current page section
          pdf.addImage(
            imgData,
            'PNG',
            xOffset,
            yOffset - currentPosition,
            scaledWidth,
            imgHeight,
            null,
            'FAST',
            // Clip to page height
            {
              sourceX: 0,
              sourceY: currentPosition,
              sourceWidth: canvas.width,
              sourceHeight: Math.min(remainingHeight, pageHeight / scale)
            }
          );
          
          // Move to next section
          currentPosition += pageHeight / scale;
          remainingHeight -= pageHeight / scale;
          
          // Add new page if there's more content
          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      } else {
        // For single page content, use the original approach
        pdf.addImage(
          imgData, 
          'PNG', 
          xOffset,
          yOffset,
          scaledWidth,
          scaledHeight,
          null,
          'FAST'
        );
      }
      
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