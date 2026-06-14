from fastapi import APIRouter, UploadFile, File, HTTPException
import io

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

router = APIRouter()

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = file.filename.split('.')[-1].lower()
    
    try:
        content = await file.read()
        
        if ext == 'txt':
            return {"text": content.decode('utf-8')}
            
        elif ext == 'pdf':
            if not HAS_PYPDF:
                raise HTTPException(status_code=500, detail="pypdf is not installed on the server.")
            
            pdf = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
            return {"text": text.strip()}
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .txt or .pdf")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
