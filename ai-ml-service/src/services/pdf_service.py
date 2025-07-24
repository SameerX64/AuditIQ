import fitz  # PyMuPDF
import logging

class PDFService:
    """Service for handling PDF document processing"""
    
    def __init__(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def extract_text_from_pdf(self, pdf_path):
        """
        Extract text content from PDF file
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            str: Extracted text content
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
            
            doc.close()
            
            if not text.strip():
                raise Exception("No text content found in PDF")
                
            self.logger.info(f"Successfully extracted {len(text)} characters from PDF")
            return text
            
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def validate_pdf_structure(self, pdf_path):
        """
        Validate PDF structure and extract metadata
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            dict: PDF metadata and validation results
        """
        try:
            doc = fitz.open(pdf_path)
            metadata = {
                'page_count': len(doc),
                'title': doc.metadata.get('title', ''),
                'author': doc.metadata.get('author', ''),
                'subject': doc.metadata.get('subject', ''),
                'is_valid': True,
                'size_mb': round(doc.total_page_count * 0.1, 2)  # Rough estimation
            }
            
            doc.close()
            return metadata
            
        except Exception as e:
            self.logger.error(f"Error validating PDF: {str(e)}")
            return {
                'is_valid': False,
                'error': str(e)
            }
