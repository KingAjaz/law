import sys

output_file = r"c:\Users\talen\Desktop\law\pdf_content.txt"

try:
    import PyPDF2
    
    pdf_path = r"c:\Users\talen\Desktop\law\LegalEase Website (220126).pdf"
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        
        with open(output_file, 'w', encoding='utf-8') as out:
            out.write(f"Total pages: {len(pdf_reader.pages)}\n")
            
            for page_num in range(len(pdf_reader.pages)):
                out.write(f"\n{'='*80}\n")
                out.write(f"PAGE {page_num + 1}\n")
                out.write(f"{'='*80}\n\n")
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                out.write(text)
                out.write("\n")
        
        print(f"PDF content extracted to: {output_file}")
            
except ImportError:
    print("PyPDF2 not installed. Trying alternative method...")
    try:
        import fitz  # PyMuPDF
        
        pdf_path = r"c:\Users\talen\Desktop\law\LegalEase Website (220126).pdf"
        
        doc = fitz.open(pdf_path)
        
        with open(output_file, 'w', encoding='utf-8') as out:
            out.write(f"Total pages: {len(doc)}\n")
            
            for page_num in range(len(doc)):
                out.write(f"\n{'='*80}\n")
                out.write(f"PAGE {page_num + 1}\n")
                out.write(f"{'='*80}\n\n")
                page = doc[page_num]
                text = page.get_text()
                out.write(text)
                out.write("\n")
            
        doc.close()
        print(f"PDF content extracted to: {output_file}")
        
    except ImportError:
        print("Neither PyPDF2 nor PyMuPDF is installed.")
        print("Installing PyPDF2...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
        print("Please run this script again.")
