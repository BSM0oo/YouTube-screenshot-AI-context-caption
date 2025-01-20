from fastapi import APIRouter, HTTPException
from modules.models import TranscriptQueryRequest, TranscriptAnalysisRequest
from modules.config import (
    anthropic_client, CLAUDE_MODEL, CLAUDE_SONNET_MODEL,
    MAX_TOKENS_DEFAULT, MAX_TOKENS_ANALYSIS
)
from transcript_retriever import EnhancedTranscriptRetriever

router = APIRouter()

@router.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    """Get transcript for a YouTube video using enhanced retrieval system"""
    try:
        print(f"Attempting to get transcript for video ID: {video_id}")
        
        transcript_retriever = EnhancedTranscriptRetriever()
        transcript = await transcript_retriever.get_transcript(video_id)
        
        if transcript:
            return {"transcript": transcript}
        else:
            raise HTTPException(
                status_code=404,
                detail="No transcript could be retrieved"
            )
            
    except Exception as e:
        print(f"Transcript error: {str(e)}")
        error_msg = f"Could not get transcript: {str(e)}"
        if "No transcript found" in str(e):
            error_msg = "No transcript/captions available for this video"
        raise HTTPException(status_code=404, detail=error_msg)

@router.post("/query-transcript")
async def query_transcript(request: TranscriptQueryRequest):
    """Process a query about the transcript using Claude"""
    try:
        # Validate transcript structure
        if not isinstance(request.transcript, list):
            raise HTTPException(status_code=422, detail="Transcript must be a list")

        if not request.transcript:
            raise HTTPException(status_code=422, detail="Transcript cannot be empty")

        # Format transcript
        formatted_transcript = []
        for item in request.transcript:
            if not isinstance(item, dict) or 'start' not in item or 'text' not in item:
                raise HTTPException(
                    status_code=422,
                    detail="Each transcript entry must have 'start' and 'text' fields"
                )
                
            timestamp = item['start']
            hours = int(timestamp // 3600)
            minutes = int((timestamp % 3600) // 60)
            seconds = int(timestamp % 60)
            time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            formatted_transcript.append(f"[{time_str}] {item['text']}")
            
        transcript_text = "\n".join(formatted_transcript)

        prompt = f"""Based on this video transcript, answer the following question or respond to this request: {request.prompt}

Transcript:
{transcript_text}

Provide your response following these exact rules:
1. Avoid using introductory statements or phrases like "The video shows...", "In this screenshot...", "The speaker explains..."
2. Never refer to "the video", "the transcript", or use phrases like "they mention" or "the speaker explains"
3. Format timestamps like this: [HH:MM:SS]
4. Only add timestamps in parentheses at the end of key points
5. If multiple consecutive points come from the same timestamp, only include the timestamp once at the end of the last related point
6. Use markdown formatting with headings and bullet points
7. Be direct and concise - no meta-commentary about the response itself

Example of desired format:

**Topic Heading:**
* I previously covered this concept in several videos about X
* This technique is particularly important for beginners [00:05:20]

**Second Topic:**
* The first step involves positioning your hands correctly
* You'll want to maintain this position throughout the movement
* This creates the optimal angle for power generation [00:08:45]

Response:"""

        response = anthropic_client.messages.create(
            model=CLAUDE_SONNET_MODEL,
            max_tokens=MAX_TOKENS_ANALYSIS,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        answer = response.content[0].text.strip()
        return {
            "response": answer,
            "prompt": request.prompt,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing transcript query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.post("/analyze-transcript")
async def analyze_transcript(request: TranscriptAnalysisRequest):
    """Analyze video transcript for structure and key points"""
    try:
        response = anthropic_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=MAX_TOKENS_ANALYSIS,
            messages=[{
                "role": "user",
                "content": f"""Analyze this video transcript and provide:
                
                1. A high-level summary of the main topics in bullet points
                2. Key points and takeaways, comprehensive (bullet points)
                3. Any important technical terms or concepts mentioned, with accompanying definitions and context
                4. Suggested sections/timestamps for review and rationale for this recommendation
                - Review your output before finalizing to ensure you have followed these instructions exactly
                - Generate a title for the video and begin your output with the title in bold

                Transcript:
                {request.transcript}
                """
            }]
        )
        
        analysis = response.content[0].text.strip()
        return {"analysis": analysis}
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
