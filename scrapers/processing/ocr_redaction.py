"""
OCR + PII Redaction Pipeline
Extracts text from bill images and automatically redacts sensitive information
"""
import os
import re
import json
from io import BytesIO
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import requests
from PIL import Image, ImageDraw, ImageFilter
from dotenv import load_dotenv

load_dotenv()

# PII patterns to redact
PII_PATTERNS = {
    # Social Security Number
    'ssn': [
        r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b',
        r'\bSSN[:\s#]*\d{3}[-\s]?\d{2}[-\s]?\d{4}\b',
    ],
    # Date of Birth
    'dob': [
        r'\b(DOB|Date of Birth|Birth Date)[:\s]*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b',
        r'\b\d{1,2}[-/]\d{1,2}[-/](19|20)\d{2}\b',  # Dates that look like DOB
    ],
    # Address
    'address': [
        r'\b\d{1,5}\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)[,.\s]+',
    ],
    # Phone numbers
    'phone': [
        r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
    ],
    # Account numbers
    'account': [
        r'\b(?:Account|Acct)[:\s#]*\d{6,20}\b',
        r'\b(?:Member|Patient|ID)[:\s#]*\d{6,20}\b',
        r'\b(?:Policy|Group)[:\s#]*[\w\d]{6,20}\b',
    ],
    # Medical Record Numbers
    'mrn': [
        r'\b(?:MRN|Medical Record)[:\s#]*\d{5,15}\b',
    ],
    # Names (after specific labels) - careful with false positives
    'name': [
        r'\b(?:Patient|Name|Member)[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b',
    ],
    # Email
    'email': [
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    ],
}

# Dollar amount patterns to extract (not redact)
DOLLAR_PATTERNS = [
    r'\$[\d,]+(?:\.\d{2})?',
    r'(?:Total|Amount|Due|Charge|Balance|Cost|Price)[:\s]*\$?[\d,]+(?:\.\d{2})?',
]


class BillProcessor:
    """Process medical bill images: OCR, extract costs, redact PII"""
    
    def __init__(self):
        self.ocr_available = self._check_tesseract()
    
    def _check_tesseract(self) -> bool:
        """Check if Tesseract OCR is available"""
        try:
            import pytesseract
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            print("Warning: Tesseract not installed. Install with: brew install tesseract")
            return False
    
    def process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Full image processing pipeline:
        1. Load image
        2. OCR to extract text
        3. Find PII and dollar amounts
        4. Create redacted version
        5. Return extracted data + redacted image
        """
        # Load image
        if image_path.startswith('http'):
            response = requests.get(image_path, timeout=30)
            image = Image.open(BytesIO(response.content))
        else:
            image = Image.open(image_path)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # OCR
        raw_text = self._ocr(image)
        
        # Find PII locations
        pii_findings = self._find_pii(raw_text)
        
        # Extract dollar amounts
        amounts = self._extract_amounts(raw_text)
        
        # Create redacted text
        redacted_text = self._redact_text(raw_text, pii_findings)
        
        # Create redacted image (if we have word-level bounding boxes)
        redacted_image = self._redact_image(image) if self.ocr_available else None
        
        # Calculate "shock value" - the largest amount found
        shock_value = max(amounts, default=0)
        
        return {
            'raw_text': raw_text,
            'redacted_text': redacted_text,
            'amounts': amounts,
            'shock_value': shock_value,
            'pii_found': list(pii_findings.keys()),
            'redacted_image': redacted_image,
            'summary': self._generate_summary(amounts, pii_findings),
        }
    
    def _ocr(self, image: Image.Image) -> str:
        """Extract text from image using Tesseract"""
        if not self.ocr_available:
            return ""
        
        try:
            import pytesseract
            
            # Preprocess image for better OCR
            # Convert to grayscale
            gray = image.convert('L')
            
            # Increase contrast
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(2.0)
            
            # OCR with config for medical bills
            config = '--oem 3 --psm 6'
            text = pytesseract.image_to_string(enhanced, config=config)
            
            return text
            
        except Exception as e:
            print(f"OCR error: {e}")
            return ""
    
    def _ocr_with_boxes(self, image: Image.Image) -> List[Dict[str, Any]]:
        """Get OCR results with bounding boxes"""
        if not self.ocr_available:
            return []
        
        try:
            import pytesseract
            
            # Get word-level bounding boxes
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            words = []
            for i, text in enumerate(data['text']):
                if text.strip():
                    words.append({
                        'text': text,
                        'x': data['left'][i],
                        'y': data['top'][i],
                        'width': data['width'][i],
                        'height': data['height'][i],
                        'conf': data['conf'][i],
                    })
            
            return words
            
        except Exception as e:
            print(f"OCR with boxes error: {e}")
            return []
    
    def _find_pii(self, text: str) -> Dict[str, List[str]]:
        """Find all PII in text"""
        findings = {}
        
        for pii_type, patterns in PII_PATTERNS.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text, re.IGNORECASE)
                matches.extend(found)
            
            if matches:
                findings[pii_type] = matches
        
        return findings
    
    def _extract_amounts(self, text: str) -> List[float]:
        """Extract all dollar amounts from text"""
        amounts = []
        
        for pattern in DOLLAR_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean and convert to float
                cleaned = re.sub(r'[^\d.]', '', str(match))
                try:
                    amount = float(cleaned)
                    if amount > 0:
                        amounts.append(amount)
                except ValueError:
                    pass
        
        # Dedupe and sort
        amounts = sorted(set(amounts), reverse=True)
        return amounts
    
    def _redact_text(self, text: str, pii_findings: Dict[str, List[str]]) -> str:
        """Replace PII with redaction markers"""
        redacted = text
        
        for pii_type, values in pii_findings.items():
            for value in values:
                if isinstance(value, str):
                    redaction = f"[{pii_type.upper()}_REDACTED]"
                    redacted = redacted.replace(value, redaction)
        
        return redacted
    
    def _redact_image(self, image: Image.Image) -> Optional[Image.Image]:
        """
        Create a redacted version of the image
        Blurs regions containing PII
        """
        if not self.ocr_available:
            return None
        
        try:
            # Get words with bounding boxes
            words = self._ocr_with_boxes(image)
            
            if not words:
                return None
            
            # Create copy for redaction
            redacted = image.copy()
            draw = ImageDraw.Draw(redacted)
            
            # Find words that match PII patterns
            for word in words:
                word_text = word['text']
                
                # Check if this word is part of PII
                is_pii = False
                for patterns in PII_PATTERNS.values():
                    for pattern in patterns:
                        if re.search(pattern, word_text, re.IGNORECASE):
                            is_pii = True
                            break
                    if is_pii:
                        break
                
                # Also redact pure number sequences (potential account/SSN)
                if re.match(r'^\d{4,}$', word_text):
                    is_pii = True
                
                if is_pii:
                    # Get bounding box
                    x, y = word['x'], word['y']
                    w, h = word['width'], word['height']
                    
                    # Expand box slightly
                    padding = 5
                    box = (
                        max(0, x - padding),
                        max(0, y - padding),
                        min(image.width, x + w + padding),
                        min(image.height, y + h + padding)
                    )
                    
                    # Extract region, blur it, paste back
                    region = redacted.crop(box)
                    blurred = region.filter(ImageFilter.GaussianBlur(radius=10))
                    
                    # Draw black rectangle for extra redaction
                    redacted.paste(blurred, box)
                    draw.rectangle(box, fill='black')
            
            return redacted
            
        except Exception as e:
            print(f"Image redaction error: {e}")
            return None
    
    def _generate_summary(self, amounts: List[float], pii_findings: Dict[str, List[str]]) -> str:
        """Generate a shock-value summary for the bill"""
        if not amounts:
            return "Medical bill - amount unclear"
        
        max_amount = max(amounts)
        
        if max_amount >= 100000:
            shock = "CATASTROPHIC"
        elif max_amount >= 50000:
            shock = "DEVASTATING"
        elif max_amount >= 20000:
            shock = "SEVERE"
        elif max_amount >= 5000:
            shock = "SIGNIFICANT"
        else:
            shock = "Standard"
        
        summary = f"${max_amount:,.0f} medical bill"
        
        if 'name' in pii_findings:
            summary = f"{shock}: {summary}"
        
        return summary
    
    def process_batch(self, image_paths: List[str]) -> List[Dict[str, Any]]:
        """Process multiple images"""
        results = []
        
        for path in image_paths:
            try:
                result = self.process_image(path)
                result['source_path'] = path
                results.append(result)
            except Exception as e:
                print(f"Error processing {path}: {e}")
                results.append({
                    'source_path': path,
                    'error': str(e)
                })
        
        return results


def process_story_images(story: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process all images attached to a story
    Returns story with OCR data added
    """
    processor = BillProcessor()
    
    images = story.get('images', [])
    if not images:
        return story
    
    all_amounts = []
    all_text = []
    processed_images = []
    
    for image_url in images:
        try:
            result = processor.process_image(image_url)
            
            all_amounts.extend(result.get('amounts', []))
            if result.get('redacted_text'):
                all_text.append(result['redacted_text'])
            
            processed_images.append({
                'url': image_url,
                'summary': result.get('summary', ''),
                'shock_value': result.get('shock_value', 0),
                'pii_found': result.get('pii_found', []),
            })
            
        except Exception as e:
            print(f"Error processing image {image_url}: {e}")
    
    # Add OCR data to story
    story['ocr_amounts'] = sorted(set(all_amounts), reverse=True)
    story['ocr_text'] = '\n\n---\n\n'.join(all_text)
    story['processed_images'] = processed_images
    
    # Update cost if not already set
    if not story.get('cost_us') and all_amounts:
        story['cost_us'] = max(all_amounts)
    
    return story


# CLI for testing
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python ocr_redaction.py <image_path_or_url>")
        sys.exit(1)
    
    processor = BillProcessor()
    result = processor.process_image(sys.argv[1])
    
    print("\n" + "=" * 60)
    print("OCR + REDACTION RESULTS")
    print("=" * 60)
    print(f"\nAmounts found: {result['amounts']}")
    print(f"Shock value: ${result['shock_value']:,.2f}" if result['shock_value'] else "No amounts found")
    print(f"PII types found: {result['pii_found']}")
    print(f"\nSummary: {result['summary']}")
    print("\n" + "-" * 60)
    print("REDACTED TEXT:")
    print("-" * 60)
    print(result['redacted_text'][:2000] if result['redacted_text'] else "No text extracted")

