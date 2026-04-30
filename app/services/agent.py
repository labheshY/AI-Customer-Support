from typing import Annotated, Literal, TypedDict, Sequence
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
import json

# Import tools
from app.services.tools import (tool_get_order_status, 
                                tool_get_user_details,
                                tool_create_ticket,
                                search_knowledge_base)
# Import from db
from app.db.database import SessionLocal
from app.db.models import ChatMessage

# ------ Setup ------

# Initialize Google GenAI
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3)

# Define the tools
tools = [tool_get_order_status, tool_get_user_details, tool_create_ticket, search_knowledge_base]
model_with_tools = model.bind_tools(tools)

# Define the state
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]

# Define the nodes

def call_model(state: AgentState):
    messages = state['messages']
    response = model_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Define the graph
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

# Initialize memory
memory = MemorySaver()
app_graph = workflow.compile(checkpointer=memory)

# ------ Helper functions ------

async def run_agent_stream(query: str, session_id: str, user_id: str = None):
    """
    Generator that runs the agent and yields events (thoughts, tools, and response chunks).
    """
    db = SessionLocal()
    
    # Save user message to database
    db.add(ChatMessage(session_id=session_id, user_id=user_id, role="user", content=query))
    db.commit()

    yield json.dumps({"type": "metadata", "session_id": session_id}) + "\n"
    config = {"configurable": {"thread_id": session_id, "user_id": user_id}}
    inputs = {"messages": [HumanMessage(content=query)]}

    full_response = ""
    tokens_used = 0
    
    try:
        # Use astream_events to get granular updates
        async for event in app_graph.astream_events(inputs, config, version="v2"):
            kind = event["event"]
            
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    full_response += content
                    yield json.dumps({"type": "token", "content": content}) + "\n"
            
            elif kind == "on_tool_start":
                tool_name = event["name"]
                yield json.dumps({"type": "thought", "content": f"Using tool: {tool_name}..."}) + "\n"
                
            elif kind == "on_tool_end":
                tool_output = event["data"]["output"]
                yield json.dumps({"type": "thought", "content": f"Tool output received."}) + "\n"

            elif kind == "on_chat_model_end":
                # Extract token usage for cost monitoring
                usage = event["data"]["output"].response_metadata.get("token_usage", {})
                if usage:
                    tokens_used = usage.get("total_tokens", 0)
                    print(f"💰 [COST MONITOR] Session: {session_id} | Tokens: {usage.get('prompt_tokens', 0)} (prompt) + {usage.get('completion_tokens', 0)} (completion) = {tokens_used} (total)")
    except Exception as e:
        print(f"❌ [AGENT ERROR] {str(e)}")
        yield json.dumps({"type": "error", "content": "I'm having trouble connecting to my brain right now."}) + "\n"

    # Save assistant reply to database
    if full_response:
        db.add(ChatMessage(
            session_id=session_id, 
            user_id=user_id, 
            role="assistant", 
            content=full_response,
            tokens_used=tokens_used
        ))
        db.commit()

    db.close()

# For backward compatibility or non-streaming calls
def run_agent(query: str, session_id: str="default", user_id: str = None) -> dict:
    config = {"configurable": {"thread_id": session_id, "user_id": user_id}}
    inputs = {"messages": [HumanMessage(content=query)]}
    
    # Run synchronously
    result = app_graph.invoke(inputs, config)
    last_msg = result["messages"][-1]
    
    # Save assistant reply to database
    db = SessionLocal()
    db.add(ChatMessage(session_id=session_id, user_id=user_id, role="assistant", content=last_msg.content))
    db.commit()
    db.close()
    
    return {
        "response": last_msg.content,
        "thought": "Processed request via LangGraph."
    }
