import json
import requests


# --------------------------------------------------
# OLLAMA CONFIGURATION
# --------------------------------------------------

OLLAMA_URL = "http://localhost:11434/api/chat"

OLLAMA_MODEL = "gemma4:e2b"


# --------------------------------------------------
# OLLAMA REQUEST
# --------------------------------------------------

def call_ollama(prompt, history=None):

    messages = []

    # Previous conversation
    if history:

        for item in history:

            role = item.get("role")

            content = (
                item.get("content")
                or item.get("text")
            )

            if role == "ai":
                role = "assistant"

            if role in ["user", "assistant"] and content:

                messages.append({
                    "role": role,
                    "content": content
                })

    # Current prompt
    messages.append({
        "role": "user",
        "content": prompt
    })

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7
            }
        },
        timeout=180
    )

    response.raise_for_status()

    result = response.json()

    content = (
        result
        .get("message", {})
        .get("content", "")
        .strip()
    )

    if not content:
        raise ValueError(
            "Ollama returned an empty response."
        )

    return content


# --------------------------------------------------
# STUDY CONTEXT
# --------------------------------------------------

def build_context(data):

    return f"""
You are StudyMate, an AI Study Assistant
for university students.

Student study information:

Subject:
{data.get("subject", "")}

Topic:
{data.get("topic", "")}

Current Level:
{data.get("level", "")}

Goal:
{data.get("goal", "")}

Available Study Time:
{data.get("duration", "")}

Learning Style:
{data.get("learningStyle", "")}

Real-Time Examples:
{data.get("realTimeExamples", "Yes")}

Explain concepts according to the student's
current level.

Follow the student's preferred learning style.

Use practical and real-world examples when
they improve understanding.

If real-time examples are requested, connect
concepts with realistic applications, technology,
industry, workplace situations, or everyday
scenarios.

For exam preparation, focus on important concepts,
answer structure, and common mistakes.

Keep explanations clear and useful for university
learning.
"""


# --------------------------------------------------
# BUILD SIX STUDY PROMPTS
# --------------------------------------------------

def build_prompt(data):

    context = build_context(data)

    return f"""
{context}

Create exactly 6 different study prompts for
this student.

The six prompts must represent these learning
approaches:

1. Concept Understanding
2. Exam Preparation
3. Step-by-Step Learning
4. Practical / Real-World Examples
5. Practice Questions
6. Quick Revision

Each generated prompt must:

- Be personalized to the student's subject.
- Be personalized to the student's topic.
- Consider the student's current level.
- Consider the student's goal.
- Follow the student's learning style.
- Include real-world examples when appropriate.
- Be useful for university-level learning.
- Be something the student can copy directly
  into an AI tutor.
- Be detailed enough to produce a useful response.

Do NOT answer the student's topic.

Only create the prompts.

Return ONLY valid JSON.

Use exactly this format:

{{
    "prompts": [
        "Prompt 1",
        "Prompt 2",
        "Prompt 3",
        "Prompt 4",
        "Prompt 5",
        "Prompt 6"
    ]
}}
"""


# --------------------------------------------------
# PARSE JSON RESPONSE
# --------------------------------------------------

def parse_response(text):

    if not text:

        raise ValueError(
            "Ollama returned an empty response."
        )

    text = text.strip()

    # Remove markdown code fences
    if text.startswith("```json"):

        text = text[7:]

    elif text.startswith("```"):

        text = text[3:]

    if text.endswith("```"):

        text = text[:-3]

    text = text.strip()

    try:

        result = json.loads(text)

        prompts = result.get("prompts", [])

        if not isinstance(prompts, list):

            raise ValueError(
                "Prompts must be a list."
            )

        if len(prompts) != 6:

            raise ValueError(
                f"Expected 6 prompts, got {len(prompts)}."
            )

        return prompts

    except Exception as e:

        print("JSON parsing error:", e)
        print("Ollama response:")
        print(text)

        raise ValueError(
            "Ollama returned invalid JSON."
        )


# --------------------------------------------------
# CHATGPT OPTION
# --------------------------------------------------
# The frontend can still call this "ChatGPT".
# Internally it uses the local Ollama model.

def generate_with_chatgpt(data):

    prompt = build_prompt(data)

    text = call_ollama(prompt)

    return parse_response(text)


# --------------------------------------------------
# CUSTOM PROMPT GENERATOR
# --------------------------------------------------

def generate_custom_prompt_with_ollama(user_request):

    prompt = f"""
You are an expert AI prompt engineer.

A university student wants to create an AI prompt.

Student's request:

{user_request}

Transform the student's request into a
high-quality, detailed AI-ready prompt.

The generated prompt should:

- Clearly understand the student's intention.
- Preserve the student's original requirement.
- Add useful context where appropriate.
- Be specific and actionable.
- Be suitable for university-level learning
  when the request is academic.
- Include practical or real-world examples
  when useful.
- Define the expected output when appropriate.
- Give clear instructions to the AI tutor.
- Be easy for the student to copy and use.

Do NOT answer the student's request.

Only create the improved prompt.

Return ONLY the final prompt.

Do not add:
- Explanations
- Comments
- Markdown headings
- "Generated Prompt"
- Additional text
"""

    return call_ollama(prompt)


# --------------------------------------------------
# AI CHAT
# --------------------------------------------------

def chat_with_ai(data, message, history=None):

    context = build_context(data)

    prompt = f"""
{context}

You are now chatting directly with the student.

Answer the student's latest question.

Student's question:

{message}

Requirements:

- Explain the answer clearly.
- Match the student's current learning level.
- Follow the student's preferred learning style.
- Use examples where helpful.
- Use real-world examples when appropriate.
- For technical topics, explain the reasoning
  step by step.
- For exam-related questions, emphasize
  important points and common mistakes.
- Do not unnecessarily make the response
  extremely long.
- Focus directly on the student's question.
"""

    answer = call_ollama(
        prompt,
        history
    )

    return {
        "provider": "ChatGPT",
        "model": OLLAMA_MODEL,
        "message": answer
    }


# --------------------------------------------------
# OPTIONAL GEMINI COMPATIBILITY
# --------------------------------------------------
# If your existing Flask app still imports
# generate_with_gemini, this prevents an import error.
#
# It also uses Ollama rather than Gemini.

def generate_with_gemini(data):

    prompt = build_prompt(data)

    text = call_ollama(prompt)

    return parse_response(text)