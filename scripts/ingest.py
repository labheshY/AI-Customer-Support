import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

Data_Path = "data/raw"
DB_Path = "vectorstore"

# Load documents
def load_documents(data_path=Data_Path):
    documents = []
    for filename in os.listdir(data_path):
        if filename.endswith(".txt"):
            loader = TextLoader(os.path.join(data_path, filename), encoding="utf-8")
            documents.extend(loader.load())
    return documents

# Split documents into chunks
def split_documents(documents, chunk_size=500, chunk_overlap=100):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return text_splitter.split_documents(documents)

# Create vector store
def create_vector_store(chunks, db_path=DB_Path):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local(db_path)    


def main():
    print("Loading documents...")
    documents = load_documents()
    print(f"Loaded {len(documents)} documents.")

    print("Splitting documents into chunks...")
    chunks = split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    print("Creating vector store...")
    create_vector_store(chunks)
    print("Vector store created and saved locally.")
    print("✅ Ingestion complete!")

if __name__ == "__main__":
    main()