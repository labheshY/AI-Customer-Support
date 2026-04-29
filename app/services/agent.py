from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain_community.tools import tool
import datetime
# Import tools
from app.services.tools import (tool_get_order_status, 
                                tool_get_user_details,
                                  tool_create_ticket,
                                  search_knowledge_base)
# Import from db
from app.db.database import SessionLocal
from app.db.models import ChatMessage


# Initialize Google GenAI
genai = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.3)

# Create prompt template for the agent
system_prompt = """
You are an AI customer support agent.

You have access to tools:
- tool_get_order_status → for tracking orders
- tool_get_user_details → for user info
- tool_create_ticket → for reporting issues
- tool_search_knowledge_base → for FAQs, policies, general questions

Rules:
- If question is about order → use tool_get_order_status
- If user info needed → use tool_get_user_details
- If user reports issue → use tool_create_ticket
- If question is general (refund, delivery, policy) → use search_knowledge_base
- Always prefer tools over guessing
- If unsure → say "I don't know"
"""

# Create agent with tools
agent = create_agent(
    model=genai,
    tools=[tool_get_order_status, tool_get_user_details, tool_create_ticket, search_knowledge_base],
    system_prompt=system_prompt
)

# Run agent
def run_agent(query: str, session_id: str="default", user_id: str = None, stream=False) -> str:
    db = SessionLocal()
    
    # Load recent history from db (limit to last 15 messages to keep it fast)
    history_rows = db.query(ChatMessage)\
        .filter_by(session_id=session_id)\
        .order_by(ChatMessage.timestamp.desc())\
        .limit(15)\
        .all()
    
    # Reverse to get chronological order
    history_rows.reverse()

    # The library expects "messages" in the state
    history = []
    for row in history_rows:
        history.append({"role": row.role, "content": row.content})
    
    # Add user query to history (in memory for invoke)
    history.append({"role": "user", "content": query})

    # Save user message to database
    db.add(ChatMessage(session_id=session_id, user_id=user_id, role="user", content=query))
    db.commit()

    try:
        # Invoke agent with conversation history
        response = agent.invoke({"messages": history})
        
        # Get the last message from the response
        # The response structure for this library seems to put results in "messages"
        if "messages" in response and len(response["messages"]) > 0:
            reply = response["messages"][-1].content
        else:
            reply = "I received an empty response from the agent."
            
    except Exception as e:
        print(f"Agent error: {e}")
        reply = f"I'm sorry, I encountered an error: {str(e)}"
    
    # Save assistant reply to database
    db.add(ChatMessage(session_id=session_id, user_id=user_id, role="assistant", content=reply))
    db.commit()

    db.close()

    return reply
