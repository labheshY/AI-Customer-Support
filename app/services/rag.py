from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

# Load embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Load vector store
vector_store = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)

# Initialize Google GenAI
genai = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.3)

# ------ RAG Function ------

def retrieve_and_generate(query: str) -> str:
    # Retrieve relevant chunks from vector store with scores
    docs_with_scores = vector_store.similarity_search_with_score(query, k=3)

    # Filter chunks based on score threshold (e.g., 0.5)
    score_threshold = 0.5
    relevant_chunks = [doc for doc, score in docs_with_scores if score >= score_threshold]
    
    #Handle irrelevant data
    if not relevant_chunks:
        return "I don't have enough information to answer that."


    # Combine retrieved chunks into context
    context = "\n\n".join([chunk.page_content for chunk in relevant_chunks])

    # Create prompt for GenAI
    prompt = f"""
                You are a helpful customer support assistant. 
                Use the following context only to answer the question. 
                If the context does not contain the answer, say you don't know.
                Context:\n{context}\n\n
                Question: {query}\n
                Answer:
            """

    # Generate response using GenAI
    response = genai.invoke(prompt)
    return response.content
